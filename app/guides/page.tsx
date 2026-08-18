import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { getGuidesByCategory } from "@/lib/guides";
import "./guides.css";

export const metadata: Metadata = {
  title: { absolute: "Photo Booth Guides | PicToFu" },
  description: "Practical PicToFu guides for making photo strips, taking better photobooth photos, pose ideas, crop and framing, aspect ratios, and printing.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Photo Booth Guides | PicToFu",
    description: "Practical guides for shooting, styling, exporting, and printing better photo strips.",
    url: "https://pictofu.com/guides",
    siteName: "PicToFu",
    type: "website",
  },
};

const CATEGORY_COPY = {
  "Getting Started": "Use the product without guessing where crop, upload, order, and export controls live.",
  Shooting: "Improve the source photos with better light, framing, camera placement, and four-cut rhythm.",
  "Pose Ideas": "Simple sequences for solo sessions, couples, and friends that change naturally between frames.",
  Output: "Understand ratios and turn the generated PNG into the format you actually want to keep or print.",
} as const;

export default function GuidesPage() {
  const groups = getGuidesByCategory();

  return (
    <main className="guides-shell">
      <header className="guide-header">
        <BrandLink />
        <nav aria-label="Guides navigation">
          <Link href="/">Home</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo strips</Link>
        </nav>
        <Link className="guide-header__cta" href="/booth">Start Booth ✦</Link>
      </header>

      <section className="guides-hero">
        <p className="guide-kicker">PicToFu Guides</p>
        <h1>Use the booth better, not longer.</h1>
        <p>Short, practical guides for the moments where a photobooth suddenly becomes confusing: what to do during four countdowns, how to keep everyone inside the crop, which ratio changes the composition, or how to print the PNG afterward.</p>
        <div className="guides-hero__actions">
          <Link href="/guides/how-to-use-pictofu">Start with the complete walkthrough</Link>
          <Link href="/booth">Open PicToFu</Link>
        </div>
      </section>

      <section className="guides-principles" aria-label="Guide principles">
        <article><strong>Task first</strong><span>Each page solves one real photo-strip problem.</span></article>
        <article><strong>Product truthful</strong><span>Guides describe features that exist in the current browser experience.</span></article>
        <article><strong>No photo cloud</strong><span>The current booth processes capture, uploads, editing, and PNG composition in-browser.</span></article>
      </section>

      <div className="guides-categories">
        {(Object.keys(groups) as Array<keyof typeof groups>).map((category) => (
          <section className="guides-category" key={category} aria-labelledby={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}>
            <header>
              <div>
                <p className="guide-kicker">{category}</p>
                <h2 id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}>{category}</h2>
              </div>
              <p>{CATEGORY_COPY[category]}</p>
            </header>
            <div className="guides-grid">
              {groups[category].map((guide) => (
                <Link className="guide-card" href={`/guides/${guide.slug}`} key={guide.slug}>
                  <span>{guide.readTime}</span>
                  <strong>{guide.title}</strong>
                  <p>{guide.description}</p>
                  <small>Read guide →</small>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="guide-final-cta">
        <span aria-hidden="true">♡ ✦ ♡</span>
        <h2>Reading is optional. Making the strip is the point.</h2>
        <p>If you already know what you want to try, jump straight into the browser booth and come back only when you hit a specific question.</p>
        <Link href="/booth">Start Booth ✦</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
