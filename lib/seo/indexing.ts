import type { Metadata } from "next";

/** Search engine indexing is off unless ALLOW_INDEXING is exactly "true". */
export function isIndexingAllowed(): boolean {
  return process.env.ALLOW_INDEXING === "true";
}

/** Paths that must never be indexed, even when indexing is allowed. */
export function isAlwaysNoIndexPath(pathname: string): boolean {
  return pathname === "/vehicle" || pathname.startsWith("/vehicle/");
}

export function robotsMetadata(noIndex = false): Metadata["robots"] {
  if (!isIndexingAllowed()) return { index: false, follow: false };
  return noIndex ? { index: false, follow: true } : { index: true, follow: true };
}

export function robotsHeaderValue(pathname: string): string {
  if (!isIndexingAllowed()) return "noindex, nofollow";
  if (isAlwaysNoIndexPath(pathname)) return "noindex, follow";
  return "";
}
