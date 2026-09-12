/** localStorage key for owner analytics exclusion (not auth / not a cookie). */
export const ANALYTICS_ADMIN_STORAGE_KEY = "autoviewer_admin";

/**
 * True when the site owner has enabled analytics exclusion.
 * Safe on the server (returns false). Never throws if storage is unavailable.
 */
export function isAnalyticsExcluded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ANALYTICS_ADMIN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Apply ?admin=true / ?admin=false from the current URL, persist to localStorage,
 * and strip the param from the visible URL via history.replaceState.
 * Call this before loading GA or sending any analytics events.
 */
export function applyAdminAnalyticsExclusionFromUrl(): void {
  if (typeof window === "undefined") return;

  try {
    const url = new URL(window.location.href);
    const admin = url.searchParams.get("admin");
    if (admin !== "true" && admin !== "false") return;

    if (admin === "true") {
      window.localStorage.setItem(ANALYTICS_ADMIN_STORAGE_KEY, "true");
    } else {
      window.localStorage.removeItem(ANALYTICS_ADMIN_STORAGE_KEY);
    }

    url.searchParams.delete("admin");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", next);
  } catch {
    // Never break the site for analytics exclusion
  }
}
