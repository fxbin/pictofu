"use client";

import Link from "next/link";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnalyticsBridge } from "@/components/analytics-bridge";
import {
  clearAccessibleGaCookies,
  getServerAnalyticsConsent,
  persistAnalyticsConsent,
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";
import {
  clearRetentionMeasurement,
  recordRetentionVisit,
} from "@/lib/retention-measurement";
import styles from "./analytics-consent-gate.module.css";

type AnalyticsConsentGateProps = {
  configured: boolean;
  measurementId: string;
};

const LazyAnalyticsWebVitals = lazy(() => import("@/components/analytics-web-vitals"));

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
  if (consent === "granted") return "Cookies allowed";
  if (consent === "denied") return "Cookieless";
  return "Optional cookies";
}

export function AnalyticsConsentGate({ configured, measurementId }: AnalyticsConsentGateProps) {
  const consent = useSyncExternalStore(
    subscribeAnalyticsConsent,
    readAnalyticsConsent,
    getServerAnalyticsConsent,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const initializedRef = useRef(false);
  const analyticsAllowed = consent === "granted";
  const googleEnabled = configured && runtimeReady;

  useEffect(() => {
    if (!analyticsAllowed) return;
    recordRetentionVisit();
  }, [analyticsAllowed]);

  useEffect(() => {
    if (!configured) return;

    if (!initializedRef.current) {
      window.dataLayer = window.dataLayer ?? [];
      window.gtag =
        window.gtag ??
        ((...args: unknown[]) => {
          window.dataLayer?.push(args);
        });

      // Advanced Consent Mode: Google measurement can initialize in a storage-denied
      // state. Analytics cookies remain unavailable until the visitor explicitly grants
      // analytics storage, while advertising-related storage always stays denied.
      window.gtag("consent", "default", DENIED_CONSENT);
      if (readAnalyticsConsent() === "granted") {
        window.gtag("consent", "update", GRANTED_CONSENT);
      }
      window.gtag("set", "ads_data_redaction", true);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      initializedRef.current = true;
    }

    const scriptId = "pictofu-ga4-loader";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const markReady = () => {
      const current = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (current) current.dataset.loaded = "true";
      setRuntimeReady(true);
    };

    if (existing?.dataset.loaded === "true") {
      const timer = window.setTimeout(markReady, 0);
      return () => window.clearTimeout(timer);
    }

    if (existing) {
      existing.addEventListener("load", markReady, { once: true });
      return () => existing.removeEventListener("load", markReady);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.addEventListener("load", markReady, { once: true });
    document.head.appendChild(script);

    return () => script.removeEventListener("load", markReady);
  }, [configured, measurementId]);

  useEffect(() => {
    if (!configured || !initializedRef.current || !window.gtag) return;
    window.gtag(
      "consent",
      "update",
      consent === "granted" ? GRANTED_CONSENT : DENIED_CONSENT,
    );
  }, [configured, consent]);

  function allowAnalytics() {
    window.gtag?.("consent", "update", GRANTED_CONSENT);
    persistAnalyticsConsent("granted");
    setSettingsOpen(false);
  }

  function declineAnalytics() {
    clearRetentionMeasurement();
    window.gtag?.("consent", "update", DENIED_CONSENT);
    clearAccessibleGaCookies();
    persistAnalyticsConsent("denied");
    setSettingsOpen(false);
  }

  const showPanel = consent === "unknown" || settingsOpen;
  const showSettingsButton = consent !== "unknown" && !settingsOpen;

  return (
    <>
      <AnalyticsBridge configured={configured} enabled={googleEnabled} />

      {googleEnabled && analyticsAllowed && (
        <Suspense fallback={null}>
          <LazyAnalyticsWebVitals />
        </Suspense>
      )}

      {showPanel && (
        <section className={styles.banner} aria-label="Analytics privacy settings">
          <div className={styles.titleRow}>
            <strong>Analytics choices</strong>
            <span className={styles.status}>{consentLabel(consent)}</span>
          </div>
          <p className={styles.copy}>
            PicToFu uses privacy-minimized aggregate measurement to understand the product. {configured
              ? "Google Analytics can also receive limited cookieless measurement pings while analytics storage is denied. Allow analytics to enable Google Analytics cookies and browser-local D1/D7/D30 return measurement."
              : "Allow analytics to enable browser-local D1/D7/D30 return measurement."} Photos, filenames, and a PicToFu user or session ID are not sent as analytics fields.
          </p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={allowAnalytics}>
              {consent === "granted" ? "Keep analytics" : "Allow analytics"}
            </button>
            <button className={styles.secondary} type="button" onClick={declineAnalytics}>
              {consent === "granted" ? "Use cookieless mode" : "Keep cookieless"}
            </button>
            <Link className={styles.privacyLink} href="/privacy" prefetch={false}>Privacy</Link>
          </div>
        </section>
      )}

      {showSettingsButton && (
        <button
          className={styles.settingsButton}
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
