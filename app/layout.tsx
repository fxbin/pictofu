import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsBridge } from "@/components/analytics-bridge";
import "./globals.css";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const analyticsEnabled =
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" && /^G-[A-Z0-9]+$/.test(measurementId);

export const metadata: Metadata = {
  metadataBase: new URL("https://pictofu.com"),
  title: {
    default: "PicTofu — Your cute online photobooth",
    template: "%s | PicTofu",
  },
  description:
    "Snap cute photo strips in your browser. No app, no account, and your photos stay on your device.",
  applicationName: "PicTofu",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PicTofu — Your cute online photobooth",
    description:
      "Open, pose, style, download. A playful browser photobooth for cute photo strips.",
    url: "https://pictofu.com",
    siteName: "PicTofu",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {analyticsEnabled && (
          <>
            <Script id="pictofu-ga4-bootstrap" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config','${measurementId}',{send_page_view:false});`}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
              strategy="afterInteractive"
            />
          </>
        )}
        {children}
        <AnalyticsBridge enabled={analyticsEnabled} />
        <Analytics />
      </body>
    </html>
  );
}
