export type AnalyticsConsent = "unknown" | "granted" | "denied";

export const ANALYTICS_CONSENT_STORAGE_KEY = "pictofu.analytics-consent.v3";
const LEGACY_ANALYTICS_CONSENT_STORAGE_KEYS = [
  "pictofu.analytics-consent.v2",
  "pictofu.analytics-consent.v1",
] as const;
const ANALYTICS_CONSENT_CHANGE_EVENT = "pictofu:analytics-consent-change";

let volatileConsent: AnalyticsConsent = "unknown";

export function parseAnalyticsConsent(value: string | null): AnalyticsConsent {
  return value === "granted" || value === "denied" ? value : "unknown";
}

export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return "unknown";
  try {
    return parseAnalyticsConsent(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY));
  } catch {
    return volatileConsent;
  }
}

export function getServerAnalyticsConsent(): AnalyticsConsent {
  return "unknown";
}

export function subscribeAnalyticsConsent(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ANALYTICS_CONSENT_STORAGE_KEY) onStoreChange();
  };
  const handleLocalChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, handleLocalChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, handleLocalChange);
  };
}

export function persistAnalyticsConsent(value: Exclude<AnalyticsConsent, "unknown">) {
  if (typeof window === "undefined") return;
  volatileConsent = value;
  try {
    // v3 introduces GA4 Advanced Consent Mode. Do not silently reinterpret a prior
    // Basic-Consent grant/decline; visitors see the updated analytics choice once.
    for (const key of LEGACY_ANALYTICS_CONSENT_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, value);
  } catch {
    // Keep the choice for the current page lifecycle if persistent storage is unavailable.
  }
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));
}

export function clearAccessibleGaCookies() {
  if (typeof document === "undefined") return;
  const cookieNames = document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  const domainAttributes = [""];
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === "pictofu.com" || hostname.endsWith(".pictofu.com")) {
      domainAttributes.push("; Domain=pictofu.com");
    }
  }

  for (const name of cookieNames) {
    for (const domainAttribute of domainAttributes) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domainAttribute}`;
    }
  }
}
