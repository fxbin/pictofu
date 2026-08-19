"use client";

import { useEffect, useRef } from "react";
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

    if (enabled && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: `${window.location.origin}${pathname}`,
        page_title: document.title,
      });
    }

    if (pathname in LANDING_PRESET_BY_PATH && lastLandingPath.current !== pathname) {
      lastLandingPath.current = pathname;
      emitProductEvent("landing_view", {
        landing_type: pathname === "/" ? "home" : "seo_intent",
        entry_preset: LANDING_PRESET_BY_PATH[pathname],
        referrer_class: referrerClass(),
        ...acquisitionParameters(),
      });
    }

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
  }, [enabled]);

  return null;
}
