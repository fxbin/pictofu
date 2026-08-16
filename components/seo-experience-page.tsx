import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { PresetDemoMedia } from "@/components/preset-demo-media";
import { SiteFooter } from "@/components/site-footer";
import { getReadyPresetDemoAsset } from "@/lib/demo-assets";
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
  const demoAsset = getReadyPresetDemoAsset(preset.id);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: experience.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="seo-shell">
      <header className="seo-header">
        <BrandLink />
        <nav aria-label="Page navigation">
          <Link href="/">Home</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo Strip</Link>
        </nav>
        <Link className="seo-header__cta" href={`/booth?preset=${preset.id}`}>Start Booth ✦</Link>
      </header>

      <section className="seo-hero">
        <div className="seo-hero__copy">
          <p className="seo-eyebrow">✦ {experience.eyebrow}</p>
          <h1>{experience.h1}</h1>
          <p className="seo-intro">{experience.intro}</p>
          <div className="seo-actions">
            <Link className="seo-primary" href={`/booth?preset=${preset.id}`}>{experience.cta}</Link>
            <Link className="seo-secondary" href="/photo-strip-maker">See strip styles</Link>
          </div>
          <p className="seo-privacy">▣ Photos are processed in your browser in the current PicToFu MVP.</p>
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
            <span>{preset.filterId}</span>
            <span>{preset.frameId} frame</span>
          </div>
        </div>
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
        <Link className="seo-primary" href={`/booth?preset=${preset.id}`}>{experience.cta}</Link>
      </section>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
