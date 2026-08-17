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
  if (consent === "granted") return "Allowed";
  if (consent === "denied") return "Off";
  return "Optional";
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
  const wantsGoogle = configured && consent === "granted";
  const googleEnabled = wantsGoogle && runtimeReady;

  useEffect(() => {
    if (!wantsGoogle) return;

    if (!initializedRef.current) {
      window.dataLayer = window.dataLayer ?? [];
      window.gtag =
        window.gtag ??
        ((...args: unknown[]) => {
          window.dataLayer?.push(args);
        });

      window.gtag("consent", "default", GRANTED_CONSENT);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false });
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
  }, [measurementId, wantsGoogle]);

  function allowAnalytics() {
    persistAnalyticsConsent("granted");
    setSettingsOpen(false);
  }

  function declineAnalytics() {
    if (consent === "granted") {
      window.gtag?.("consent", "update", DENIED_CONSENT);
      clearAccessibleGaCookies();
      persistAnalyticsConsent("denied");
      window.location.reload();
      return;
    }

    persistAnalyticsConsent("denied");
    setSettingsOpen(false);
  }

  const showPanel = configured && (consent === "unknown" || settingsOpen);
  const showSettingsButton = configured && consent !== "unknown" && !settingsOpen;

  return (
    <>
      <AnalyticsBridge enabled={googleEnabled} />

      {googleEnabled && (
        <Suspense fallback={null}>
          <LazyAnalyticsWebVitals />
        </Suspense>
      )}

      {showPanel && (
        <section className={styles.banner} aria-label="Google Analytics privacy settings">
          <div className={styles.titleRow}>
            <strong>Optional Google Analytics</strong>
            <span className={styles.status}>{consentLabel(consent)}</span>
          </div>
          <p className={styles.copy}>
            PicToFu uses Vercel Web Analytics for bounded traffic and product-event measurement without photo media. Optional Google Analytics only loads after you allow it.
          </p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={allowAnalytics}>
              {consent === "granted" ? "Keep Google Analytics" : "Allow Google Analytics"}
            </button>
            <button className={styles.secondary} type="button" onClick={declineAnalytics}>
              {consent === "granted" ? "Turn off Google Analytics" : consent === "denied" ? "Keep off" : "No thanks"}
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
