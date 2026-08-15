import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About PicTofu | Cute Online Photobooth",
  description:
    "Learn how PicTofu works, what layouts and filters it supports, how photos stay in your browser, and how to troubleshoot camera or sharing issues.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About PicTofu | Cute Online Photobooth",
    description:
      "A browser-first photobooth for quick photo strips, filters, frames, retakes, downloads, and sharing.",
    url: "https://pictofu.com/about",
    siteName: "PicTofu",
    type: "website",
  },
};

const FAQ = [
  {
    question: "What is PicTofu?",
    answer:
      "PicTofu is a browser-based photobooth for making photo strips without installing an app or creating an account. You choose a look, use your camera, review the shots, style the strip, then download or share it.",
  },
  {
    question: "Are my photos uploaded to PicTofu?",
    answer:
      "In the current PicTofu MVP, captured camera frames and the composed photo strip are processed in your browser. PicTofu does not maintain a cloud photo gallery or account-based photo history.",
  },
  {
    question: "Does PicTofu work on iPhone, Android, and desktop?",
    answer:
      "PicTofu is designed for current iPhone Safari, Android Chrome, and modern desktop browsers. Camera, download, and native share behavior can still vary by browser, device, permissions, and embedded in-app browsers.",
  },
  {
    question: "Why is my camera not opening?",
    answer:
      "Check that your browser has camera permission for PicTofu, close another app that may be using the camera, and reload the booth. On mobile, opening PicTofu in Safari or Chrome instead of an embedded browser can also help.",
  },
  {
    question: "Which layouts, filters, and frames are available?",
    answer:
      "The current preset system supports four-cut strips, three-cut strips, a 2×2 grid, and a Polaroid-style layout, with Original, B&W, Warm, Vintage, and Y2K filters plus cream, pink, lilac, and mint frame themes.",
  },
  {
    question: "Can I retake only one photo?",
    answer:
      "Yes. After a capture set is complete, PicTofu lets you review the individual slots and retake a selected shot while keeping the other captured photos.",
  },
  {
    question: "How does sharing work?",
    answer:
      "On supported browsers, PicTofu uses the device's native share sheet for the finished PNG. If file sharing is not supported, the product falls back to saving or showing the finished image so you can continue with the sharing options available on your device.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function AboutPage() {
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <BrandLink />
        <nav aria-label="About page navigation">
          <Link href="/">Home</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo strips</Link>
        </nav>
        <Link className={styles.headerCta} href="/booth">Start Booth ✦</Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>About PicTofu</p>
        <h1>A tiny photobooth that lives in your browser.</h1>
        <p className={styles.lede}>
          PicTofu is built around one simple promise: no install, no account, and no unnecessary steps between opening the site and making a photo strip.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryAction} href="/booth">Open the booth ✦</Link>
          <Link className={styles.secondaryAction} href="/photo-strip-maker">See photo strip styles</Link>
        </div>
      </section>

      <section className={styles.trustGrid} aria-label="PicTofu product principles">
        <article>
          <span aria-hidden="true">▣</span>
          <h2>Browser-first</h2>
          <p>Camera, review, styling, and export happen in the web experience, without an app install.</p>
        </article>
        <article>
          <span aria-hidden="true">♡</span>
          <h2>Private by design</h2>
          <p>The current MVP keeps captured photos and the composed strip in your browser rather than a PicTofu cloud gallery.</p>
        </article>
        <article>
          <span aria-hidden="true">⇩</span>
          <h2>Made to finish</h2>
          <p>The experience is optimized around getting from camera permission to a downloadable or shareable strip quickly.</p>
        </article>
      </section>

      <section className={styles.how} aria-labelledby="how-title">
        <div className={styles.sectionHeading}>
          <p>How it works</p>
          <h2 id="how-title">Choose → Capture → Curate → Style → Share</h2>
        </div>
        <ol>
          <li><span>01</span><div><strong>Choose a look</strong><p>Start from a PicTofu preset that defines the strip geometry, filter, frame, and number of shots.</p></div></li>
          <li><span>02</span><div><strong>Open the camera</strong><p>Grant browser camera permission and use the front camera by default, with a flip path when another camera is available.</p></div></li>
          <li><span>03</span><div><strong>Pose through the countdown</strong><p>Capture the three- or four-shot session using the built-in countdown.</p></div></li>
          <li><span>04</span><div><strong>Review and retake</strong><p>Keep the shots you like and selectively retake a single slot instead of restarting the whole set.</p></div></li>
          <li><span>05</span><div><strong>Finish the strip</strong><p>Apply the current style controls, export the PNG, then download or use the sharing options your browser supports.</p></div></li>
        </ol>
      </section>

      <section className={styles.capabilities} aria-labelledby="capabilities-title">
        <div className={styles.sectionHeading}>
          <p>Current MVP</p>
          <h2 id="capabilities-title">What you can make today</h2>
        </div>
        <div className={styles.capabilityGrid}>
          <article>
            <h3>Layouts</h3>
            <p>1×4 strip · 1×3 strip · 2×2 grid · Polaroid-style</p>
          </article>
          <article>
            <h3>Filters</h3>
            <p>Original · B&W · Warm · Vintage · Y2K</p>
          </article>
          <article>
            <h3>Frames</h3>
            <p>Cream · Pink · Lilac · Mint</p>
          </article>
          <article>
            <h3>Review</h3>
            <p>Retake all or selectively replace a single captured slot.</p>
          </article>
        </div>
      </section>

      <section className={styles.support} aria-labelledby="support-title">
        <div className={styles.sectionHeading}>
          <p>Device support</p>
          <h2 id="support-title">If the camera looks stuck</h2>
        </div>
        <div className={styles.supportCopy}>
          <p>
            PicTofu is designed for current mobile and desktop browsers, with special attention to iPhone Safari and Android Chrome. Camera APIs are still controlled by the browser and operating system, so behavior can vary between devices.
          </p>
          <ul>
            <li>Confirm camera permission is allowed for PicTofu.</li>
            <li>Close another app or browser tab that may be holding the camera.</li>
            <li>Reload the booth after changing camera permission.</li>
            <li>If an in-app browser behaves differently, try opening the page directly in Safari or Chrome.</li>
            <li>For sharing, use the native share sheet when offered; otherwise save the finished image and share it from your device.</li>
          </ul>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <p>Quick answers</p>
          <h2 id="faq-title">PicTofu FAQ</h2>
        </div>
        <div className={styles.faqItems}>
          {FAQ.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <span aria-hidden="true">♡ ✦ ♡</span>
        <h2>Ready when you are.</h2>
        <p>Open the booth, make a strip, and keep the result on your device.</p>
        <Link className={styles.primaryAction} href="/booth">Start Booth ✦</Link>
      </section>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
