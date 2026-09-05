import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { PresetDemoMedia } from "@/components/preset-demo-media";
import { SiteFooter } from "@/components/site-footer";
import { getReadyPresetDemoAsset } from "@/lib/demo-assets";
import { getFilterStyle } from "@/lib/filter-styles";
import { getFrameStyle } from "@/lib/frame-styles";
import { PICTOFU_GEO_FACTS, PICTOFU_SITE_URL } from "@/lib/geo";
import type { SeoExperience } from "@/lib/seo-pages";
import { getSeoExperience } from "@/lib/seo-pages";
import type { BoothPreset } from "@/lib/presets";
import { getPreset } from "@/lib/presets";

const LAYOUT_LABELS: Record<BoothPreset["layoutId"], string> = {
  "strip-4": "1 × 4 strip",
  "strip-3": "1 × 3 strip",
  "grid-4": "2 × 2 grid",
  polaroid: "Polaroid",
};

export function SeoExperiencePage({ experience }: { experience: SeoExperience }) {
  const preset = getPreset(experience.presetId);
  const filter = getFilterStyle(preset.filterId);
  const frame = getFrameStyle(preset.frameId);
  const demoAsset = getReadyPresetDemoAsset(preset.id);
  const boothHref = `/booth?preset=${preset.id}`;
  const canonicalUrl = `${PICTOFU_SITE_URL}/${experience.slug}`;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: experience.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: experience.title,
    description: experience.description,
    inLanguage: "en",
    isPartOf: { "@id": `${PICTOFU_SITE_URL}/#website` },
    about: { "@id": `${PICTOFU_SITE_URL}/#app` },
    mainEntity: { "@id": `${PICTOFU_SITE_URL}/#app` },
  };

  return (
    <main className="seo-shell">
      <header className="seo-header">
        <BrandLink />
        <nav aria-label="Page navigation">
          <Link href="/">Home</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo Strip</Link>
          <Link href="/guides">Guides</Link>
        </nav>
        <Link className="seo-header__cta" href={boothHref}>Start Booth ✦</Link>
      </header>

      <aside className="seo-share-context" aria-label="Shared PicToFu preset">
        <div>
          <span>Shared with you</span>
          <strong>Someone made this with PicToFu.</strong>
          <p>Use the same {preset.name} starting look, then make the strip your own.</p>
        </div>
        <Link href={boothHref}>Make yours with {preset.name} →</Link>
      </aside>

      <section className="seo-hero">
        <div className="seo-hero__copy">
          <p className="seo-eyebrow">✦ {experience.eyebrow}</p>
          <h1>{experience.h1}</h1>
          <p className="seo-intro">{experience.intro}</p>
          <div className="seo-actions">
            <Link className="seo-primary" href={boothHref}>{experience.cta}</Link>
            <Link className="seo-secondary" href="/photo-strip-maker">See strip styles</Link>
          </div>
          <p className="seo-privacy">▣ Photos are processed in your browser and stay out of a PicToFu cloud photo gallery.</p>
        </div>

        <div className={`seo-preset-card seo-preset-card--${preset.frameId}`} aria-label={`${preset.name} preset preview`}>
          <div className="seo-preset-card__top">
            <span>PicToFu preset</span>
            <strong>{preset.name}</strong>
          </div>
          <div className={`seo-preset-strip seo-preset-strip--${preset.layoutId}`}>
            {demoAsset ? (
              <PresetDemoMedia
                presetId={preset.id}
                sizes="(max-width: 760px) 52vw, 180px"
              />
            ) : (
              <>
                {Array.from({ length: preset.shotCount }).map((_, index) => (
                  <div className={`seo-preset-photo seo-preset-photo--${preset.filterId}`} key={index} aria-hidden="true">
                    <span>{index % 2 === 0 ? "◕‿◕" : "◕ᴗ◕"}</span>
                  </div>
                ))}
                <small>✦ PicToFu ♡</small>
              </>
            )}
          </div>
          <div className="seo-preset-meta">
            <span>{LAYOUT_LABELS[preset.layoutId]}</span>
            <span>{filter.label}</span>
            <span>{frame.label}</span>
          </div>
        </div>
      </section>

      <section className="seo-answer" aria-labelledby="quick-answer-title">
        <div>
          <p className="seo-section-kicker">Quick answer</p>
          <h2 id="quick-answer-title">What can you do on this page?</h2>
          <p>{experience.description}</p>
        </div>
        <dl>
          {PICTOFU_GEO_FACTS.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="seo-highlights" aria-label="Experience highlights">
        {experience.highlights.map((highlight, index) => (
          <article key={highlight}>
            <span aria-hidden="true">0{index + 1}</span>
            <p>{highlight}</p>
          </article>
        ))}
      </section>

      <section className="seo-how" aria-labelledby="how-it-works">
        <div>
          <p className="seo-section-kicker">How it works</p>
          <h2 id="how-it-works">From link to finished strip in three steps</h2>
        </div>
        <ol>
          {experience.howItWorks.map((step, index) => (
            <li key={step}><span>{index + 1}</span><p>{step}</p></li>
          ))}
        </ol>
      </section>

      <section className="seo-faq" aria-labelledby="faq-title">
        <div>
          <p className="seo-section-kicker">Quick answers</p>
          <h2 id="faq-title">About this PicToFu experience</h2>
        </div>
        <div className="seo-faq__items">
          {experience.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="seo-related" aria-labelledby="related-title">
        <div className="seo-related__heading">
          <p className="seo-section-kicker">Try another look</p>
          <h2 id="related-title">Related photobooth experiences</h2>
        </div>
        <div className="seo-related__links">
          {experience.related.map((slug) => {
            const related = getSeoExperience(slug);
            if (!related) return null;
            return <Link key={slug} href={`/${slug}`}><strong>{related.title}</strong><span>{related.eyebrow} →</span></Link>;
          })}
        </div>
      </section>

      <section className="seo-final-cta">
        <span aria-hidden="true">♡ ✦ ♡</span>
        <h2>Ready when you are.</h2>
        <p>No install, no account — open the preset and make the strip.</p>
        <Link className="seo-primary" href={boothHref}>{experience.cta}</Link>
      </section>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
