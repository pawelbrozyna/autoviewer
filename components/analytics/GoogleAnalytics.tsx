"use client";

import Script from "next/script";
import { Suspense, useLayoutEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleAnalyticsPageViews } from "@/components/analytics/GoogleAnalyticsPageViews";
import {
  applyAdminAnalyticsExclusionFromUrl,
  isAnalyticsExcluded,
} from "@/lib/analytics-exclusion";

function resolveGaId(): string | null {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!gaId || !/^G-[A-Z0-9]+$/i.test(gaId)) return null;
  return gaId;
}

/**
 * Cookieless GA4 via Consent Mode defaults (all denied, never granted).
 * Loads only on the client after admin exclusion is applied from the URL,
 * so ?admin=true never fires a hit before the flag is stored.
 */
function GoogleAnalyticsLoader() {
  const searchParams = useSearchParams();
  const [gaId, setGaId] = useState<string | null>(null);

  useLayoutEffect(() => {
    applyAdminAnalyticsExclusionFromUrl();
    if (isAnalyticsExcluded()) {
      setGaId(null);
      if (typeof window !== "undefined") {
        window.__AV_GA_READY__ = false;
      }
      return;
    }
    setGaId(resolveGaId());
  }, [searchParams]);

  if (!gaId) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
          `,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
          window.__AV_GA_READY__ = true;
        `}
      </Script>
      <GoogleAnalyticsPageViews />
    </>
  );
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsLoader />
    </Suspense>
  );
}
