"use client";

import { useEffect, useRef } from "react";
import { emitProductEvent } from "@/lib/analytics";
import { SEO_EXPERIENCES } from "@/lib/seo-pages";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const LANDING_PRESET_BY_PATH: Record<string, string> = Object.fromEntries([
  ["/", "classic-booth"],
  ...SEO_EXPERIENCES.map((experience) => [`/${experience.slug}`, experience.presetId]),
]);

const MAX_PENDING_GOOGLE_EVENTS = 32;

type PendingGoogleEvent = {
  name: string;
  parameters: Record<string, unknown>;
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

function acquisitionParameters() {
  const params = new URLSearchParams(window.location.search);
  return {
    share_marker: params.get("src") ?? undefined,
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined,
  };
}

function googleEventFromDetail(detail: Record<string, unknown>): PendingGoogleEvent | null {
  const eventName = detail.event_name;
  if (typeof eventName !== "string") return null;

  const {
    event_name: _eventName,
    session_id: _sessionId,
    timestamp: _timestamp,
    ...parameters
  } = detail;
  void _eventName;
  void _sessionId;
  void _timestamp;
  return { name: eventName, parameters };
}

export function AnalyticsBridge({
  configured,
  enabled,
}: {
  configured: boolean;
  enabled: boolean;
}) {
  const lastLandingPath = useRef<string | null>(null);
  const pendingGoogleEvents = useRef<PendingGoogleEvent[]>([]);

  useEffect(() => {
    function forwardToGoogle(event: Event) {
      if (!(event instanceof CustomEvent)) return;
      const googleEvent = googleEventFromDetail(event.detail as Record<string, unknown>);
      if (!googleEvent) return;

      if (enabled && window.gtag) {
        window.gtag("event", googleEvent.name, googleEvent.parameters);
        return;
      }

      // Product events can happen before gtag.js finishes loading. Keep a small bounded
      // in-memory queue so the first landing/start signals are not lost from GA4 when
      // Advanced Consent Mode is configured. If the tag is blocked, the queue simply dies
      // with the page and the independent aggregate funnel remains the source of truth.
      if (configured && pendingGoogleEvents.current.length < MAX_PENDING_GOOGLE_EVENTS) {
        pendingGoogleEvents.current.push(googleEvent);
      }
    }

    window.addEventListener("pictofu:analytics", forwardToGoogle);
    return () => window.removeEventListener("pictofu:analytics", forwardToGoogle);
  }, [configured, enabled]);

  useEffect(() => {
    if (!enabled || !window.gtag || pendingGoogleEvents.current.length === 0) return;
    const pending = pendingGoogleEvents.current.splice(0, MAX_PENDING_GOOGLE_EVENTS);
    for (const event of pending) {
      window.gtag("event", event.name, event.parameters);
    }
  }, [enabled]);

  useEffect(() => {
    const pathname = window.location.pathname;
    const acquisition = acquisitionParameters();
    const entryPreset = LANDING_PRESET_BY_PATH[pathname];
    const isShareLanding = acquisition.share_marker === "share" && Boolean(entryPreset);

    if (isShareLanding) document.documentElement.dataset.pictofuShareLanding = "true";
    else delete document.documentElement.dataset.pictofuShareLanding;

    if (enabled && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: `${window.location.origin}${pathname}`,
        page_title: document.title,
      });
    }

    if (entryPreset && lastLandingPath.current !== pathname) {
      lastLandingPath.current = pathname;
      emitProductEvent("landing_view", {
        landing_type: pathname === "/" ? "home" : "seo_intent",
        entry_preset: entryPreset,
        referrer_class: referrerClass(),
        ...acquisition,
      });
      if (isShareLanding) {
        emitProductEvent("share_landing_view", {
          entry_preset: entryPreset,
          share_marker: "share",
        });
      }
    }

    function handleBoothClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/booth") return;

      const targetPreset = url.searchParams.get("preset") ?? entryPreset ?? "classic-booth";
      emitProductEvent("start_booth", {
        cta_location: pathname === "/" ? "home" : "landing_to_booth",
        entry_preset: targetPreset,
      });
      if (isShareLanding) {
        emitProductEvent("share_to_booth", {
          entry_preset: targetPreset,
          share_marker: "share",
        });
      }
    }

    document.addEventListener("click", handleBoothClick, true);
    return () => {
      document.removeEventListener("click", handleBoothClick, true);
      delete document.documentElement.dataset.pictofuShareLanding;
    };
  }, [enabled]);

  return null;
}
