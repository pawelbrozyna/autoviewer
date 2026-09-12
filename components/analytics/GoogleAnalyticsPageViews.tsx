"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isAnalyticsExcluded } from "@/lib/analytics-exclusion";

declare global {
  interface Window {
    __AV_GA_READY__?: boolean;
    gtag?: (...args: unknown[]) => void;
  }
}

function pagePath(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function sendPageView(path: string) {
  if (isAnalyticsExcluded()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

/**
 * Sends a single page_view per App Router URL (initial + client navigations).
 * GA config uses send_page_view: false to avoid duplicates with gtag.js.
 */
export function GoogleAnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAnalyticsExcluded()) return;

    const path = pagePath(pathname, searchParams);
    if (lastPathRef.current === path) return;

    let cancelled = false;
    let attempts = 0;

    function trySend() {
      if (cancelled || isAnalyticsExcluded()) return;
      if (window.__AV_GA_READY__ && typeof window.gtag === "function") {
        lastPathRef.current = path;
        sendPageView(path);
        return;
      }
      attempts += 1;
      if (attempts < 40) {
        window.setTimeout(trySend, 50);
      }
    }

    trySend();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}
