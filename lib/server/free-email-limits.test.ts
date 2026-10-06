/**
 * Free report email limit fixtures.
 * Run: npm run test:email-limits
 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

for (const name of [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "VERCEL",
]) {
  delete process.env[name];
}

const originalCwd = process.cwd();
const workDir = mkdtempSync(path.join(tmpdir(), "av-email-limits-"));
process.chdir(workDir);

async function main() {
  const {
    FREE_EMAIL_GLOBAL_MAX_PER_DAY,
    FREE_EMAIL_MAX_PER_IP,
    tryConsumeFreeReportEmail,
  } = await import("./free-email-limits");

  const ip = "203.0.113.7";
  const registration = "V1NTH";

  const other = (email: string) =>
    tryConsumeFreeReportEmail({ ip, email, registration });

  assert.equal(await other("buyer@example.com"), true);
  assert.equal(
    await other("buyer@example.com"),
    false,
    "registration+email limit blocks a repeat send",
  );

  for (let i = 0; i < FREE_EMAIL_MAX_PER_IP; i++) {
    await other(`filler${i}@example.com`);
  }
  assert.equal(
    await other("someone-new@example.com"),
    false,
    "IP limit blocks other addresses",
  );

  for (let i = 0; i < FREE_EMAIL_GLOBAL_MAX_PER_DAY; i++) {
    await tryConsumeFreeReportEmail({
      ip: `198.51.100.${i % 250}-${i}`,
      email: `global${i}@example.com`,
      registration: `AB${i}CDE`,
    });
  }
  assert.equal(
    await tryConsumeFreeReportEmail({
      ip: "192.0.2.1",
      email: "fresh@example.com",
      registration: "XY12ZZZ",
    }),
    false,
    "global daily cap blocks a fresh sender",
  );

  for (const email of [
    "pawelbrozyna@gmail.com",
    "  PawelBrozyna@Gmail.com ",
  ]) {
    for (let i = 0; i < 5; i++) {
      assert.equal(
        await tryConsumeFreeReportEmail({ ip, email, registration }),
        true,
        `owner bypass for "${email}" attempt ${i + 1}`,
      );
    }
  }

  assert.equal(
    await other("pawelbrozyna@gmail.com.example.com"),
    false,
    "lookalike addresses are not bypassed",
  );

  console.log("Free email limit tests passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.chdir(originalCwd);
    rmSync(workDir, { recursive: true, force: true });
  });
