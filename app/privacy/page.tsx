import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import styles from "./privacy.module.css";

const CONTACT_EMAIL = "fxbin123@gmail.com";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | PicToFu" },
  description:
    "Learn how PicToFu handles camera access, local photo uploads, browser-local photo processing, analytics, cookies, retention, and privacy choices.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | PicToFu",
    description:
      "How PicToFu handles camera access, local photo uploads, analytics, cookies, retention, and privacy choices.",
    url: "https://pictofu.com/privacy",
    siteName: "PicToFu",
    type: "website",
  },
};

const LAST_UPDATED = "August 17, 2026";

export default function PrivacyPage() {
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <BrandLink />
        <nav aria-label="Privacy page navigation">
          <Link href="/">Home</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo strips</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link className={styles.headerCta} href="/booth">Start Booth ✦</Link>
      </header>

      <article className={styles.article}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Privacy at PicToFu</p>
          <h1>Privacy Policy</h1>
          <p className={styles.lede}>
            PicToFu is designed so the core photobooth can work without an account and without uploading your captured or device-selected photos to a PicToFu photo server.
          </p>
          <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>
        </div>

        <section className={styles.summary} aria-label="Privacy summary">
          <strong>Your photos stay with you.</strong>
          <p>
            In the current PicToFu service, camera frames, captured shots, photos you select from your device, filters, strip composition, and PNG export are processed in your browser. PicToFu does not maintain a cloud photo gallery or account-based photo history.
          </p>
        </section>

        <section>
          <h2>1. Scope</h2>
          <p>
            This policy describes the privacy practices for the PicToFu website and browser-based photobooth. It covers the current public service and the analytics services described below. If PicToFu later adds accounts, cloud photo storage, payments, advertising, or other material data processing, this policy will be updated before those features are treated as part of the normal service.
          </p>
        </section>

        <section>
          <h2>2. Camera, local uploads, and photo processing</h2>
          <p>
            PicToFu asks your browser for camera permission only when a camera experience needs it. Your browser and operating system control that permission. You can deny or revoke camera access through your browser or device settings. You can also choose existing photos from your device without enabling the camera.
          </p>
          <p>
            In the current service, captured image bytes, device-selected photo files, and the final composed photo strip stay in browser memory while you use the booth. Local photo selection uses browser object URLs so the selected images can be previewed and cropped without a PicToFu media-upload request. PicToFu does not intentionally transmit captured or selected photos, camera frames, Blob URLs, base64 image data, or the generated PNG to analytics providers. If you download or share an image, the resulting file is handled by your browser, device, or the destination you choose.
          </p>
        </section>

        <section>
          <h2>3. Information we may process</h2>
          <p>
            PicToFu may process limited technical and usage information needed to operate, secure, and understand the site. Depending on the measurement service and your analytics choice, this can include page paths, bounded acquisition labels, device class, referrer category, cohort date, and product interaction stages such as starting the booth or completing an export.
          </p>
          <p>
            Product measurement uses small, structured fields. It must not include your photo content, camera frames, exported image bytes, Blob URLs, base64 data, filenames, or free-form text taken from your images.
          </p>
        </section>

        <section>
          <h2>4. Analytics and product measurement</h2>
          <h3>Vercel Web Analytics</h3>
          <p>
            PicToFu uses Vercel Web Analytics for aggregated website traffic measurement, such as page visits and general traffic context provided by the hosting analytics service. This is separate from the PicToFu product-funnel counters described below.
          </p>

          <h3>Privacy-minimized product funnel counters</h3>
          <p>
            PicToFu records privacy-minimized daily funnel counters so we can understand whether visitors reach stages such as landing, opening the booth, granting camera access, completing capture or local photo selection, exporting, downloading, or sharing. These counters are aggregated by bounded dimensions such as page path, preset, device class, referrer category, and campaign labels such as UTM source/content.
          </p>
          <p>
            The aggregate growth store does not store a PicToFu user ID, analytics session ID, IP address, photo media, filenames, or free-form text. The browser uses session storage only to avoid counting the same funnel stage repeatedly during one browser session; that session marker is not included in the aggregate payload. PicToFu&apos;s current aggregate counter infrastructure is hosted with Supabase.
          </p>

          <h3>Optional first-party rolling retention</h3>
          <p>
            If you choose <strong>Allow analytics</strong>, PicToFu can store a small first-party cohort record in local browser storage so we can estimate whether the same browser profile returns after one, seven, or thirty days. The record contains the cohort date, bounded first-touch acquisition context, device class, and which rolling retention milestones have already been counted. It does not contain a PicToFu user ID, analytics session ID, fingerprint, photo media, or free-form text.
          </p>
          <p>
            The server receives only aggregate cohort dimensions and a bucket such as new browser, rolling D1, rolling D7, or rolling D30. For this measurement, D7 means the browser returned seven or more days after the cohort date, and D30 means it returned thirty or more days after the cohort date. The aggregate retention store does not receive the browser-local cohort record itself or any identifier that lets PicToFu reconstruct a person-level visit history.
          </p>

          <h3>Google Analytics 4</h3>
          <p>
            Google Analytics 4 (GA4) is optional and is not required for the photobooth to function. When GA4 is configured, PicToFu uses the same visible analytics-consent choice: the Google Analytics tag is not loaded until you choose <strong>Allow analytics</strong>. If you decline, the core photobooth and the privacy-minimized aggregate funnel counters remain usable without GA4 or first-party rolling retention.
          </p>
          <p>
            After analytics consent is granted, GA4 can collect usage information such as user and session statistics, approximate geolocation, browser/device information, page views, and structured product events. Google Analytics can use a first-party identifier such as the <code>_ga</code> cookie when analytics storage is allowed. Advertising storage, ad personalization, and remarketing remain disabled in the current setup.
          </p>
          <p>
            You can reopen PicToFu&apos;s Privacy settings and change the analytics choice. If a previously granted choice is revoked, PicToFu clears the browser-local PicToFu retention cohort record, stores the denied state, clears accessible GA cookies, and reloads the page so the next page lifecycle starts without loading the Google Analytics tag.
          </p>
        </section>

        <section>
          <h2>5. Cookies and local browser storage</h2>
          <p>
            The core PicToFu booth does not require an account cookie or a cloud photo-session cookie. PicToFu stores your analytics consent choice in first-party browser storage so it can be remembered on later visits. If analytics is allowed, PicToFu also stores the small retention cohort record described above in local storage. The browser-local acquisition context and one-per-session growth-stage markers are kept in session storage and contain no photo media; the session identifier used by optional analytics is not sent to the aggregate growth or retention counters.
          </p>
        </section>

        <section>
          <h2>6. Third-party infrastructure</h2>
          <p>
            PicToFu uses third-party infrastructure to deliver and understand the website. Vercel hosts and serves the application and may provide aggregated traffic analytics. Supabase hosts the privacy-minimized daily product-funnel counters and aggregate retention counters. Google Analytics may provide additional optional product and acquisition measurement only after the analytics consent gate allows it. Those providers process limited technical information under their own terms and privacy documentation.
          </p>
          <p>
            PicToFu does not authorize these measurement services to receive captured or device-selected photo bytes as part of the current analytics contract.
          </p>
        </section>

        <section>
          <h2>7. Data retention</h2>
          <p>
            PicToFu does not maintain a server-side library of your captured or device-selected photos in the current service. Temporary browser objects used during a booth session are intended to disappear when the page/session is cleared, while files you choose to download remain under your control on your device.
          </p>
          <p>
            The PicToFu growth and retention stores retain aggregate counts rather than user/session event histories. If analytics is allowed, the browser-local retention cohort record can remain in local storage so later D1/D7/D30 returns can be counted once; it is removed when you turn analytics off or when you clear the relevant browser storage. Other aggregated analytics data, when enabled, is retained according to the configured provider and PicToFu&apos;s account settings with that provider. PicToFu does not use analytics retention to reconstruct or store your photo content.
          </p>
        </section>

        <section>
          <h2>8. International processing</h2>
          <p>
            PicToFu is available over the internet and may rely on service providers that operate infrastructure in multiple countries. As a result, limited technical or analytics information may be processed outside the country where you are located, subject to the safeguards and terms offered by the relevant provider.
          </p>
        </section>

        <section>
          <h2>9. Your privacy choices and rights</h2>
          <p>
            Depending on where you live, privacy law may give you rights concerning personal information, which can include access, correction, deletion, restriction, objection, portability, or withdrawal of consent. PicToFu currently has no user account or cloud photo library, so many requests involving photos can be resolved directly by clearing the browser session or deleting files you saved to your own device.
          </p>
          <p>
            You can reopen the visible Privacy settings control to allow, decline, or withdraw optional analytics. The preference and any PicToFu retention cohort marker are stored in your browser rather than in a PicToFu user account.
          </p>
        </section>

        <section>
          <h2>10. Children and minors</h2>
          <p>
            PicToFu is a general-audience creative tool and is not designed specifically for children. The current service does not ask users to create accounts or submit profile information. Parents or guardians should supervise camera, local photo selection, and sharing use where appropriate for the user&apos;s age and local requirements.
          </p>
        </section>

        <section>
          <h2>11. Changes to this policy</h2>
          <p>
            We may update this policy as PicToFu changes. Material additions such as cloud photo storage, accounts, payments, targeted advertising, or materially different analytics will require the policy to be reviewed and updated before those capabilities are treated as part of the normal production service. The date at the top of this page shows the latest revision.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            For privacy questions or requests, email <a href={`mailto:${CONTACT_EMAIL}?subject=PicToFu%20Privacy%20Inquiry`}>{CONTACT_EMAIL}</a>. You can also use the <Link href="/contact">PicToFu contact page</Link> for general questions and product feedback.
          </p>
          <p>
            Because the current PicToFu service has no user account system or cloud photo library, please do not send photo content unless you intentionally choose to attach it and it is necessary to explain your request.
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
