"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { emitProductEvent } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const LANDING_PRESET_BY_PATH: Record<string, string> = {
  "/": "classic-booth",
  "/online-photobooth": "classic-booth",
  "/photo-strip-maker": "classic-booth",
  "/korean-photobooth": "korean-date",
  "/y2k-photobooth": "y2k-summer",
  "/vintage-photobooth": "vintage-film",
  "/couple-photobooth": "couple-date",
  "/best-friend-photobooth": "best-friends",
  "/graduation-photobooth": "graduation",
};

function referrerClass() {
  const referrer = document.referrer;
  if (!referrer) return "direct";

  try {
    const url = new URL(referrer);
    if (url.hostname === window.location.hostname) return "internal";
    if (/google\.|bing\.|duckduckgo\.|yahoo\./i.test(url.hostname)) return "search";
    if (/tiktok\.|instagram\.|pinterest\.|reddit\.|x\.com$|twitter\./i.test(url.hostname)) return "social";
    return "referral";
  } catch {
    return "unknown";
  }
}

function reportWebVital(metric: {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating?: string;
}) {
  emitProductEvent("web_vital", {
    metric_id: metric.id,
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 1000) / 1000,
    metric_delta: Math.round(metric.delta * 1000) / 1000,
    metric_rating: metric.rating ?? "unknown",
  });
}

export function AnalyticsBridge({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const lastLandingPath = useRef<string | null>(null);

  useReportWebVitals(reportWebVital);

  useEffect(() => {
    if (!(pathname in LANDING_PRESET_BY_PATH)) return;
    if (lastLandingPath.current === pathname) return;
    lastLandingPath.current = pathname;

    emitProductEvent("landing_view", {
      landing_type: pathname === "/" ? "home" : "seo_intent",
      entry_preset: LANDING_PRESET_BY_PATH[pathname],
      referrer_class: referrerClass(),
    });
  }, [pathname]);

  useEffect(() => {
    function handleBoothClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/booth") return;

      emitProductEvent("start_booth", {
        cta_location: pathname === "/" ? "home" : "landing_to_booth",
        entry_preset: url.searchParams.get("preset") ?? LANDING_PRESET_BY_PATH[pathname] ?? "classic-booth",
      });
    }

    document.addEventListener("click", handleBoothClick, true);
    return () => document.removeEventListener("click", handleBoothClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return;

    function forwardToProvider(event: Event) {
      if (!(event instanceof CustomEvent) || !window.gtag) return;
      const detail = event.detail as Record<string, unknown>;
      const eventName = detail.event_name;
      if (typeof eventName !== "string") return;

      const { event_name: _eventName, ...parameters } = detail;
      void _eventName;
      window.gtag("event", eventName, parameters);
    }

    window.addEventListener("pictofu:analytics", forwardToProvider);
    return () => window.removeEventListener("pictofu:analytics", forwardToProvider);
  }, [enabled]);

  return null;
}
