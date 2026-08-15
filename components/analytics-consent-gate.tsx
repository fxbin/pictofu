"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnalyticsBridge } from "@/components/analytics-bridge";
import {
  clearAccessibleGaCookies,
  persistAnalyticsConsent,
  readAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";
import styles from "./analytics-consent-gate.module.css";

type AnalyticsConsentGateProps = {
  configured: boolean;
  measurementId: string;
};

const GRANTED_CONSENT = {
  analytics_storage: "granted",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

const DENIED_CONSENT = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

function consentLabel(consent: AnalyticsConsent) {
  if (consent === "granted") return "Allowed";
  if (consent === "denied") return "Off";
  return "Optional";
}

export function AnalyticsConsentGate({ configured, measurementId }: AnalyticsConsentGateProps) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<AnalyticsConsent>("unknown");
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const initializedRef = useRef(false);
  const isBooth = pathname === "/booth";

  useEffect(() => {
    const stored = readAnalyticsConsent();
    setConsent(stored);
    setSettingsOpen(stored === "unknown");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!configured || !hydrated || consent !== "granted") {
      setGoogleEnabled(false);
      return;
    }

    if (!initializedRef.current) {
      window.dataLayer = window.dataLayer ?? [];
      window.gtag =
        window.gtag ??
        function gtag() {
          window.dataLayer?.push(arguments);
        };

      window.gtag("consent", "default", GRANTED_CONSENT);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false });
      initializedRef.current = true;
    }

    setGoogleEnabled(true);
  }, [configured, consent, hydrated, measurementId]);

  function allowAnalytics() {
    persistAnalyticsConsent("granted");
    setConsent("granted");
    setSettingsOpen(false);
  }

  function declineAnalytics() {
    persistAnalyticsConsent("denied");

    if (consent === "granted") {
      window.gtag?.("consent", "update", DENIED_CONSENT);
      clearAccessibleGaCookies();
      window.location.reload();
      return;
    }

    setConsent("denied");
    setGoogleEnabled(false);
    setSettingsOpen(false);
  }

  const showPanel = configured && hydrated && settingsOpen;
  const showSettingsButton = configured && hydrated && consent !== "unknown" && !settingsOpen;

  return (
    <>
      {googleEnabled && (
        <Script
          id="pictofu-ga4-loader"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
        />
      )}

      <AnalyticsBridge enabled={googleEnabled} />

      {showPanel && (
        <section
          className={`${styles.banner} ${isBooth ? styles.boothBanner : ""}`}
          aria-label="Analytics privacy settings"
        >
          <div className={styles.titleRow}>
            <strong>Help improve PicTofu?</strong>
            <span className={styles.status}>{consentLabel(consent)}</span>
          </div>
          <p className={styles.copy}>
            Analytics helps us understand visits and completed photo strips. Google Analytics only loads after you allow it, and PicTofu never sends your photos in analytics events.
          </p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={allowAnalytics}>
              {consent === "granted" ? "Keep analytics" : "Allow analytics"}
            </button>
            <button className={styles.secondary} type="button" onClick={declineAnalytics}>
              {consent === "granted" ? "Turn off analytics" : consent === "denied" ? "Keep off" : "No thanks"}
            </button>
            <Link className={styles.privacyLink} href="/privacy">Privacy</Link>
          </div>
        </section>
      )}

      {showSettingsButton && (
        <button
          className={`${styles.settingsButton} ${isBooth ? styles.settingsButtonBooth : ""}`}
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-expanded={settingsOpen}
        >
          Privacy settings
        </button>
      )}
    </>
  );
}
