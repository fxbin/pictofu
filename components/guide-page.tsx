import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import type { Guide } from "@/lib/guides";
import { getGuide } from "@/lib/guides";

export function GuidePage({ guide }: { guide: Guide }) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    dateModified: "2026-08-18",
    datePublished: "2026-08-18",
    author: { "@type": "Organization", name: "PicToFu" },
    publisher: { "@type": "Organization", name: "PicToFu" },
    mainEntityOfPage: `https://pictofu.com/guides/${guide.slug}`,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="guide-shell">
      <header className="guide-header">
        <BrandLink />
        <nav aria-label="Guide navigation">
          <Link href="/guides">Guides</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo strips</Link>
        </nav>
        <Link className="guide-header__cta" href={guide.presetId ? `/booth?preset=${guide.presetId}` : "/booth"}>{guide.ctaLabel}</Link>
      </header>

      <article className="guide-article">
        <div className="guide-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>›</span><Link href="/guides">Guides</Link><span>›</span><span>{guide.category}</span>
        </div>

        <header className="guide-hero">
          <p className="guide-kicker">{guide.category} · {guide.readTime}</p>
          <h1>{guide.h1}</h1>
          <p className="guide-intro">{guide.intro}</p>
          <div className="guide-meta"><span>Updated {guide.updated}</span><span>Written for the current PicToFu browser experience</span></div>
        </header>

        <div className="guide-layout">
          <div className="guide-body">
            {guide.sections.map((section, index) => (
              <section key={section.heading} id={`section-${index + 1}`}>
                <p className="guide-section-number">0{index + 1}</p>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && (
                  <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                )}
              </section>
            ))}

            <section className="guide-checklist" aria-labelledby="guide-checklist-title">
              <p className="guide-section-number">✓</p>
              <h2 id="guide-checklist-title">Quick checklist</h2>
              <ul>{guide.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>

            <section className="guide-faq" aria-labelledby="guide-faq-title">
              <p className="guide-section-number">?</p>
              <h2 id="guide-faq-title">Quick answers</h2>
              <div>
                {guide.faq.map((item) => (
                  <details key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="guide-aside" aria-label="Guide actions">
            <div className="guide-aside__card guide-aside__card--primary">
              <span>Try it now</span>
              <strong>Use the guide while the booth is open.</strong>
              <p>PicToFu runs in your browser, so you can capture or upload a set and apply the steps immediately.</p>
              <Link href={guide.presetId ? `/booth?preset=${guide.presetId}` : "/booth"}>{guide.ctaLabel} →</Link>
            </div>
            <div className="guide-aside__card">
              <span>Privacy</span>
              <strong>Your photo content stays out of a PicToFu cloud gallery.</strong>
              <p>The current booth handles camera shots, local uploads, editing, and PNG composition in the browser.</p>
              <Link href="/privacy">Read the privacy details →</Link>
            </div>
          </aside>
        </div>

        <section className="guide-related" aria-labelledby="guide-related-title">
          <div>
            <p className="guide-kicker">Keep going</p>
            <h2 id="guide-related-title">Related PicToFu guides</h2>
          </div>
          <div className="guide-related__grid">
            {guide.related.map((slug) => {
              const related = getGuide(slug);
              if (!related) return null;
              return (
                <Link href={`/guides/${related.slug}`} key={related.slug}>
                  <span>{related.category}</span>
                  <strong>{related.title}</strong>
                  <small>{related.readTime} →</small>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="guide-final-cta">
          <span aria-hidden="true">✦ ♡ ✦</span>
          <h2>Make the strip, then improve the next one.</h2>
          <p>The point of a guide is not to turn a photobooth into homework. Use the parts that solve your current problem and keep the session moving.</p>
          <Link href={guide.presetId ? `/booth?preset=${guide.presetId}` : "/booth"}>{guide.ctaLabel}</Link>
        </section>
      </article>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
