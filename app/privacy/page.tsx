import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | PicTofu" },
  description:
    "Learn how PicTofu handles camera access, browser-local photo processing, analytics, cookies, retention, and privacy choices.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | PicTofu",
    description:
      "How PicTofu handles camera access, photos, analytics, cookies, retention, and privacy choices.",
    url: "https://pictofu.com/privacy",
    siteName: "PicTofu",
    type: "website",
  },
};

const LAST_UPDATED = "August 15, 2026";

export default function PrivacyPage() {
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <BrandLink />
        <nav aria-label="Privacy page navigation">
          <Link href="/">Home</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo strips</Link>
        </nav>
        <Link className={styles.headerCta} href="/booth">Start Booth ✦</Link>
      </header>

      <article className={styles.article}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Privacy at PicTofu</p>
          <h1>Privacy Policy</h1>
          <p className={styles.lede}>
            PicTofu is designed so the core photobooth can work without an account and without uploading your captured photos to a PicTofu photo server.
          </p>
          <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>
        </div>

        <section className={styles.summary} aria-label="Privacy summary">
          <strong>Your photos stay with you.</strong>
          <p>
            In the current PicTofu MVP, camera frames, captured shots, filters, strip composition, and PNG export are processed in your browser. PicTofu does not maintain a cloud photo gallery or account-based photo history.
          </p>
        </section>

        <section>
          <h2>1. Scope</h2>
          <p>
            This policy describes the privacy practices for the PicTofu website and browser-based photobooth. It covers the current public MVP and the analytics services described below. If PicTofu later adds accounts, cloud photo storage, payments, advertising, or other material data processing, this policy will be updated before those features are treated as part of the normal service.
          </p>
        </section>

        <section>
          <h2>2. Camera access and photo processing</h2>
          <p>
            PicTofu asks your browser for camera permission only when a camera experience needs it. Your browser and operating system control that permission. You can deny or revoke camera access through your browser or device settings.
          </p>
          <p>
            In the current MVP, captured image bytes and the final composed photo strip stay in browser memory while you use the booth. PicTofu does not intentionally transmit captured photos, camera frames, Blob URLs, base64 image data, or the generated PNG to analytics providers. If you download or share an image, the resulting file is handled by your browser, device, or the destination you choose.
          </p>
        </section>

        <section>
          <h2>3. Information we may process</h2>
          <p>
            PicTofu may process limited technical and usage information needed to operate, secure, and understand the site. Depending on which analytics services are enabled, this can include page paths, timestamps, referrer information, approximate location, browser type, operating system, device class, and product interaction events such as starting the booth or completing an export.
          </p>
          <p>
            Product analytics are designed to use small, structured event fields. They must not include your photo content, camera frames, exported image bytes, Blob URLs, base64 data, or free-form text taken from your images.
          </p>
        </section>

        <section>
          <h2>4. Analytics</h2>
          <h3>Vercel Web Analytics</h3>
          <p>
            PicTofu may use Vercel Web Analytics for aggregated traffic measurement, such as page views, referrers, general location, browser, operating system, and device information. Vercel describes its Web Analytics product as privacy-focused, cookie-free for visitor analytics, and based on anonymous aggregated data rather than persistent cross-site identifiers.
          </p>

          <h3>Google Analytics 4</h3>
          <p>
            Google Analytics 4 (GA4) is optional and is not required for the photobooth to function. When GA4 is enabled, it can collect usage information such as user and session statistics, approximate geolocation, and browser/device information. Google Analytics can use a first-party identifier such as the <code>_ga</code> cookie when analytics storage is permitted.
          </p>
          <p>
            PicTofu&apos;s production analytics plan is to respect the applicable analytics-consent state before enabling GA4 measurement for visitors who require that choice. Advertising and remarketing are not part of the current analytics setup.
          </p>
        </section>

        <section>
          <h2>5. Cookies and local browser storage</h2>
          <p>
            The core PicTofu booth does not require an account cookie or a cloud photo-session cookie. If an analytics consent control is enabled, PicTofu may store your consent choice in your browser so it can be remembered on later visits. Optional analytics providers may use browser storage or first-party cookies only according to their enabled configuration and the consent state that applies.
          </p>
        </section>

        <section>
          <h2>6. Third-party infrastructure</h2>
          <p>
            PicTofu uses third-party infrastructure to deliver the website. Vercel hosts and serves the application and may also provide privacy-focused traffic analytics when enabled. Google Analytics may provide optional product and acquisition measurement when explicitly enabled. Those providers process technical information under their own terms and privacy documentation.
          </p>
          <p>
            PicTofu does not authorize analytics providers to receive captured photo bytes as part of the current MVP analytics contract.
          </p>
        </section>

        <section>
          <h2>7. Data retention</h2>
          <p>
            PicTofu does not maintain a server-side library of your captured photos in the current MVP. Temporary browser objects used during a booth session are intended to disappear when the page/session is cleared, while files you choose to download remain under your control on your device.
          </p>
          <p>
            Aggregated analytics data, when enabled, is retained according to the configured analytics provider and PicTofu&apos;s account settings with that provider. PicTofu does not use analytics retention to reconstruct or store your photo content.
          </p>
        </section>

        <section>
          <h2>8. International processing</h2>
          <p>
            PicTofu is available over the internet and may rely on service providers that operate infrastructure in multiple countries. As a result, limited technical or analytics information may be processed outside the country where you are located, subject to the safeguards and terms offered by the relevant provider.
          </p>
        </section>

        <section>
          <h2>9. Your privacy choices and rights</h2>
          <p>
            Depending on where you live, privacy law may give you rights concerning personal information, which can include access, correction, deletion, restriction, objection, portability, or withdrawal of consent. PicTofu currently has no user account or cloud photo library, so many requests involving photos can be resolved directly by clearing the browser session or deleting files you saved to your own device.
          </p>
          <p>
            Where optional analytics consent is offered, you should be able to change or withdraw that choice through the consent controls once that production feature is enabled.
          </p>
        </section>

        <section>
          <h2>10. Children and minors</h2>
          <p>
            PicTofu is a general-audience creative tool and is not designed specifically for children. The current MVP does not ask users to create accounts or submit profile information. Parents or guardians should supervise camera and sharing use where appropriate for the user&apos;s age and local requirements.
          </p>
        </section>

        <section>
          <h2>11. Changes to this policy</h2>
          <p>
            We may update this policy as PicTofu changes. Material additions such as cloud photo storage, accounts, payments, targeted advertising, or materially different analytics will require the policy to be reviewed and updated before those capabilities are treated as part of the normal production service. The date at the top of this page shows the latest revision.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            A dedicated public privacy contact route is being added to PicTofu&apos;s site information pages before this policy is promoted as the final production legal contact point. Until that route is published, this section intentionally does not invent an email address or contact form that may not be monitored.
          </p>
        </section>

        <aside className={styles.note}>
          <strong>Plain-language note</strong>
          <p>
            This page is intended to accurately describe the current product and its engineering privacy posture. It is not jurisdiction-specific legal advice.
          </p>
        </aside>
      </article>

      <SiteFooter />
    </main>
  );
}
