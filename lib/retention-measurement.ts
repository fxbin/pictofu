const RETENTION_ENDPOINT =
  "https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/pictofu-retention-ingest";

// Supabase legacy anon JWTs are public client credentials. Authorization only permits
// invoking the JWT-protected Edge Function; the database table/RPC remain service-role only.
const RETENTION_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3emRkdnBybnlqcnJncHpjc2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NjA2NjEsImV4cCI6MjEwMjIzNjY2MX0.TO1Z4xZGBTkYR-uB2wp1RQQI7xik3DF91HPgWgbzdJk";

export const RETENTION_STORAGE_KEY = "pictofu.retention-cohort.v1";

type RetentionBucket = "new_browser" | "rolling_d1" | "rolling_d7" | "rolling_d30";

type FirstTouch = {
  first_entry_path: string;
  first_entry_preset: string;
  first_utm_source: string;
  first_utm_medium: string;
  first_utm_campaign: string;
  first_utm_content: string;
  first_referrer_class: string;
  first_device_class: string;
};

type RetentionState = {
  cohort_date: string;
  first_touch: FirstTouch;
  sent: Partial<Record<RetentionBucket, true>>;
};

const PRESET_BY_PATH: Record<string, string> = {
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

function utcDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function utcDayAge(cohortDate: string, now = new Date()) {
  const cohort = Date.parse(`${cohortDate}T00:00:00.000Z`);
  const today = Date.parse(`${utcDateString(now)}T00:00:00.000Z`);
  if (!Number.isFinite(cohort) || !Number.isFinite(today)) return 0;
  return Math.max(0, Math.floor((today - cohort) / 86_400_000));
}

function deviceClass(width: number) {
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

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

function safeToken(value: string | null, max: number) {
  if (!value) return "";
  const token = value.trim().slice(0, max);
  return /^[a-zA-Z0-9._:/+-]*$/.test(token) ? token : "";
}

function firstTouch(): FirstTouch {
  const params = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname.startsWith("/") ? window.location.pathname.slice(0, 160) : "";
  return {
    first_entry_path: pathname,
    first_entry_preset: PRESET_BY_PATH[pathname] ?? "",
    first_utm_source: safeToken(params.get("utm_source"), 80),
    first_utm_medium: safeToken(params.get("utm_medium"), 80),
    first_utm_campaign: safeToken(params.get("utm_campaign"), 120),
    first_utm_content: safeToken(params.get("utm_content"), 120),
    first_referrer_class: referrerClass(),
    first_device_class: deviceClass(window.innerWidth),
  };
}

function readState(): RetentionState | null {
  try {
    const raw = window.localStorage.getItem(RETENTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RetentionState;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed?.cohort_date ?? "")) return null;
    if (!parsed.first_touch || typeof parsed.first_touch !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeState(state: RetentionState) {
  try {
    window.localStorage.setItem(RETENTION_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function createState(): RetentionState | null {
  const state: RetentionState = {
    cohort_date: utcDateString(),
    first_touch: firstTouch(),
    sent: {},
  };
  return writeState(state) ? state : null;
}

function dueBuckets(state: RetentionState): RetentionBucket[] {
  const age = utcDayAge(state.cohort_date);
  const buckets: RetentionBucket[] = [];
  if (!state.sent.new_browser) buckets.push("new_browser");
  if (age >= 1 && !state.sent.rolling_d1) buckets.push("rolling_d1");
  if (age >= 7 && !state.sent.rolling_d7) buckets.push("rolling_d7");
  if (age >= 30 && !state.sent.rolling_d30) buckets.push("rolling_d30");
  return buckets;
}

async function sendBucket(state: RetentionState, bucket: RetentionBucket) {
  const response = await fetch(RETENTION_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${RETENTION_ANON_KEY}`,
      apikey: RETENTION_ANON_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      cohort_date: state.cohort_date,
      retention_bucket: bucket,
      ...state.first_touch,
    }),
    keepalive: true,
  });

  if (!response.ok) return false;
  state.sent[bucket] = true;
  return writeState(state);
}

export function recordRetentionVisit() {
  if (typeof window === "undefined") return;

  // Persistent storage is required for meaningful dedupe. If it is unavailable,
  // skip retention rather than emitting duplicate or un-linkable aggregate counts.
  const state = readState() ?? createState();
  if (!state) return;

  for (const bucket of dueBuckets(state)) {
    void sendBucket(state, bucket).catch(() => {
      // Retention measurement is best-effort and must never block the photobooth.
    });
  }
}

export function clearRetentionMeasurement() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RETENTION_STORAGE_KEY);
  } catch {
    // If storage is unavailable there is no persistent cohort state to clear.
  }
}
