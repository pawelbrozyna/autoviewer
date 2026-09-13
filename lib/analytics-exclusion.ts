/** Shared key for owner admin bypass (maintenance + analytics exclusion). Not authentication. */
export const ADMIN_ACCESS_KEY = "autoviewer_admin";

/** @deprecated Use ADMIN_ACCESS_KEY */
export const ANALYTICS_ADMIN_STORAGE_KEY = ADMIN_ACCESS_KEY;

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

/**
 * True when the site owner has enabled admin bypass / analytics exclusion.
 * Safe on the server (returns false). Never throws if storage is unavailable.
 */
export function isAnalyticsExcluded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ADMIN_ACCESS_KEY) === "true";
  } catch {
    return false;
  }
}

function setAdminCookie(enabled: boolean): void {
  if (typeof document === "undefined") return;
  if (enabled) {
    document.cookie = `${ADMIN_ACCESS_KEY}=true; Path=/; Max-Age=${ADMIN_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  } else {
    document.cookie = `${ADMIN_ACCESS_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

function readAdminCookie(): boolean {
  if (typeof document === "undefined") return false;
  try {
    return document.cookie
      .split(";")
      .map((part) => part.trim())
      .some((part) => part === `${ADMIN_ACCESS_KEY}=true`);
  } catch {
    return false;
  }
}

/** Keep localStorage and cookie aligned for middleware + analytics. */
export function syncAdminAccessFromCookie(): void {
  if (typeof window === "undefined") return;
  try {
    if (readAdminCookie()) {
      window.localStorage.setItem(ADMIN_ACCESS_KEY, "true");
    }
  } catch {
    // ignore
  }
}

/**
 * Apply ?admin=true / ?admin=false from the current URL, persist to localStorage
 * and cookie, and strip the param from the visible URL via history.replaceState.
 */
export function applyAdminAnalyticsExclusionFromUrl(): void {
  if (typeof window === "undefined") return;

  try {
    const url = new URL(window.location.href);
    const admin = url.searchParams.get("admin");
    if (admin !== "true" && admin !== "false") {
      syncAdminAccessFromCookie();
      return;
    }

    if (admin === "true") {
      window.localStorage.setItem(ADMIN_ACCESS_KEY, "true");
      setAdminCookie(true);
    } else {
      window.localStorage.removeItem(ADMIN_ACCESS_KEY);
      setAdminCookie(false);
    }

    url.searchParams.delete("admin");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", next);
  } catch {
    // Never break the site for admin bypass / analytics exclusion
  }
}
