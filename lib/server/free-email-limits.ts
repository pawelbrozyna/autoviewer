import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

/** Free report emails only. Paid/system mail must not call this module. */
export const FREE_EMAIL_LIMIT_MESSAGE =
  "Free email delivery limit reached. You can still view or download your report. Please try email delivery again tomorrow.";

export const FREE_EMAIL_MAX_PER_IP = 5;
export const FREE_EMAIL_MAX_PER_ADDRESS = 2;
export const FREE_EMAIL_MAX_PER_REG_EMAIL = 1;
/** Daily free quota. Leaves 400/day of a 1000/day budget for paid/system mail. */
export const FREE_EMAIL_GLOBAL_MAX_PER_DAY = 600;
export const PAID_SYSTEM_EMAIL_RESERVED_PER_DAY = 400;

const KEY_PREFIX = "av:free-email";
const STORE_PATH = path.join(
  process.cwd(),
  "data",
  "free-email-limits.json",
);

type DayStore = {
  day: string;
  global: number;
  byIp: Record<string, number>;
  byEmail: Record<string, number>;
  byRegEmail: Record<string, number>;
};

let writeChain: Promise<void> = Promise.resolve();
let redisClient: Redis | null | undefined;

function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function secondsUntilNextUtcDay(date = new Date()): number {
  const next = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
  );
  return Math.max(1, Math.ceil((next - date.getTime()) / 1000));
}

function emptyStore(day: string): DayStore {
  return {
    day,
    global: 0,
    byIp: {},
    byEmail: {},
    byRegEmail: {},
  };
}

function redisEnv() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const env = redisEnv();
  redisClient = env ? new Redis(env) : null;
  return redisClient;
}

function useFileStore(): boolean {
  if (redisEnv()) return false;
  // Vercel filesystem is ephemeral; require Redis in production.
  if (process.env.VERCEL === "1") return false;
  return true;
}

async function readFileStore(): Promise<DayStore> {
  const day = utcDayKey();
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DayStore>;
    if (parsed.day !== day) {
      return emptyStore(day);
    }
    return {
      day,
      global: Number(parsed.global) || 0,
      byIp: parsed.byIp && typeof parsed.byIp === "object" ? parsed.byIp : {},
      byEmail:
        parsed.byEmail && typeof parsed.byEmail === "object"
          ? parsed.byEmail
          : {},
      byRegEmail:
        parsed.byRegEmail && typeof parsed.byRegEmail === "object"
          ? parsed.byRegEmail
          : {},
    };
  } catch {
    return emptyStore(day);
  }
}

async function writeFileStore(store: DayStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store), "utf8");
  await fs.rename(tmp, STORE_PATH);
}

async function tryConsumeFileStore(input: {
  ip: string;
  email: string;
  regEmailKey: string;
}): Promise<boolean> {
  let allowed = false;

  writeChain = writeChain.then(async () => {
    try {
      const store = await readFileStore();
      const ipCount = store.byIp[input.ip] ?? 0;
      const emailCount = store.byEmail[input.email] ?? 0;
      const regEmailCount = store.byRegEmail[input.regEmailKey] ?? 0;

      if (
        store.global >= FREE_EMAIL_GLOBAL_MAX_PER_DAY ||
        ipCount >= FREE_EMAIL_MAX_PER_IP ||
        emailCount >= FREE_EMAIL_MAX_PER_ADDRESS ||
        regEmailCount >= FREE_EMAIL_MAX_PER_REG_EMAIL
      ) {
        allowed = false;
        return;
      }

      store.global += 1;
      store.byIp[input.ip] = ipCount + 1;
      store.byEmail[input.email] = emailCount + 1;
      store.byRegEmail[input.regEmailKey] = regEmailCount + 1;
      await writeFileStore(store);
      allowed = true;
    } catch (error) {
      console.error("Free email limit file store update failed.", error);
      allowed = false;
    }
  });

  await writeChain;
  return allowed;
}

function asCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function tryConsumeRedisStore(input: {
  ip: string;
  email: string;
  regEmailKey: string;
}): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    console.error(
      "Free email limits require Upstash Redis on Vercel. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
    return false;
  }

  const day = utcDayKey();
  const ttl = secondsUntilNextUtcDay();
  const globalKey = `${KEY_PREFIX}:${day}:global`;
  const ipKey = `${KEY_PREFIX}:${day}:ip:${input.ip}`;
  const emailKey = `${KEY_PREFIX}:${day}:email:${input.email}`;
  const regEmailKey = `${KEY_PREFIX}:${day}:reg-email:${input.regEmailKey}`;

  const current = await redis.mget<number[]>([
    globalKey,
    ipKey,
    emailKey,
    regEmailKey,
  ]);
  const globalCount = asCount(current[0]);
  const ipCount = asCount(current[1]);
  const emailCount = asCount(current[2]);
  const regEmailCount = asCount(current[3]);

  if (
    globalCount >= FREE_EMAIL_GLOBAL_MAX_PER_DAY ||
    ipCount >= FREE_EMAIL_MAX_PER_IP ||
    emailCount >= FREE_EMAIL_MAX_PER_ADDRESS ||
    regEmailCount >= FREE_EMAIL_MAX_PER_REG_EMAIL
  ) {
    return false;
  }

  const next = await redis
    .pipeline()
    .incr(globalKey)
    .incr(ipKey)
    .incr(emailKey)
    .incr(regEmailKey)
    .expire(globalKey, ttl)
    .expire(ipKey, ttl)
    .expire(emailKey, ttl)
    .expire(regEmailKey, ttl)
    .exec();

  const nextGlobal = asCount(next[0]);
  const nextIp = asCount(next[1]);
  const nextEmail = asCount(next[2]);
  const nextRegEmail = asCount(next[3]);

  if (
    nextGlobal > FREE_EMAIL_GLOBAL_MAX_PER_DAY ||
    nextIp > FREE_EMAIL_MAX_PER_IP ||
    nextEmail > FREE_EMAIL_MAX_PER_ADDRESS ||
    nextRegEmail > FREE_EMAIL_MAX_PER_REG_EMAIL
  ) {
    await redis
      .pipeline()
      .decr(globalKey)
      .decr(ipKey)
      .decr(emailKey)
      .decr(regEmailKey)
      .exec();
    return false;
  }

  return true;
}

function normalizeRegistration(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

/**
 * Atomically checks free-report email limits and records a send if allowed.
 * Returns false when any UTC-day free limit is already reached.
 *
 * Storage: Upstash Redis when configured (required on Vercel); local JSON file in development.
 */
export async function tryConsumeFreeReportEmail(input: {
  ip: string;
  email: string;
  registration: string;
}): Promise<boolean> {
  const ip = input.ip.trim() || "unknown";
  const email = input.email.trim().toLowerCase();
  const registration = normalizeRegistration(input.registration);
  const regEmailKey = `${registration}|${email}`;
  const payload = { ip, email, regEmailKey };

  try {
    if (useFileStore()) {
      return await tryConsumeFileStore(payload);
    }
    return await tryConsumeRedisStore(payload);
  } catch (error) {
    console.error("Free email limit store update failed.", error);
    return false;
  }
}
