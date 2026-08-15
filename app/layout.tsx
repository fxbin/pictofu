import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsConsentGate } from "@/components/analytics-consent-gate";
import "./globals.css";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const analyticsConfigured =
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" && /^G-[A-Z0-9]+$/.test(measurementId);

export const metadata: Metadata = {
  metadataBase: new URL("https://pictofu.com"),
  title: {
    default: "PicToFu — Your cute online photobooth",
    template: "%s | PicToFu",
  },
  description:
    "Snap cute photo strips in your browser. No app, no account, and your photos stay on your device.",
  applicationName: "PicToFu",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PicToFu — Your cute online photobooth",
    description:
      "Open, pose, style, download. A playful browser photobooth for cute photo strips.",
    url: "https://pictofu.com",
    siteName: "PicToFu",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnalyticsConsentGate configured={analyticsConfigured} measurementId={measurementId} />
        <Analytics />
      </body>
    </html>
  );
}
