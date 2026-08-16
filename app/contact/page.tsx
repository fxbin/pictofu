import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import styles from "../privacy/privacy.module.css";

const CONTACT_EMAIL = "fxbin123@gmail.com";

export const metadata: Metadata = {
  title: { absolute: "Contact PicToFu" },
  description:
    "Contact PicToFu for general questions, product feedback, or privacy requests about the browser-based photobooth.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact PicToFu",
    description:
      "How to reach PicToFu for general questions, product feedback, and privacy requests.",
    url: "https://pictofu.com/contact",
    siteName: "PicToFu",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <BrandLink />
        <nav aria-label="Contact page navigation">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <Link className={styles.headerCta} href="/booth">Start Booth ✦</Link>
      </header>

      <article className={styles.article}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Contact PicToFu</p>
          <h1>One inbox, kept simple.</h1>
          <p className={styles.lede}>
            PicToFu is currently an independent project. General questions, product feedback, and privacy requests can all be sent to the monitored email address below.
          </p>
        </div>

        <section className={styles.summary} aria-label="Contact email">
          <strong>{CONTACT_EMAIL}</strong>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>Open your email app</a> to send a message to PicToFu.
          </p>
        </section>

        <section>
          <h2>General questions and feedback</h2>
          <p>
            Use this inbox for product feedback, browser compatibility questions, bug reports, or other questions about PicToFu.
          </p>
        </section>

        <section>
          <h2>Privacy requests</h2>
          <p>
            For privacy questions or requests, email <a href={`mailto:${CONTACT_EMAIL}?subject=PicToFu%20Privacy%20Inquiry`}>{CONTACT_EMAIL}</a> and include enough context for us to understand the request. PicToFu currently has no user account system or cloud photo library.
          </p>
        </section>

        <section>
          <h2>What not to send</h2>
          <p>
            Please do not send captured photos, exported photo strips, or other sensitive image content unless you intentionally choose to attach it and it is necessary to explain your request. PicToFu does not need your photo content to receive a normal support or privacy message.
          </p>
        </section>

        <section>
          <h2>How contact messages are handled</h2>
          <p>
            PicToFu does not use an on-site contact form in the current MVP. When you use the email links on this page, your message is sent through your chosen email provider rather than being submitted to a PicToFu contact-form database.
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
