import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { HomeBoothPreview } from "@/components/home-booth-preview";
import { PresetDemoMedia } from "@/components/preset-demo-media";
import { SiteFooter } from "@/components/site-footer";
import { getReadyPresetDemoAsset } from "@/lib/demo-assets";
import { FEATURED_PRESETS } from "@/lib/presets";

function Sparkle({ className = "" }: { className?: string }) {
  return <span className={`sparkle ${className}`} aria-hidden="true">✦</span>;
}

function TemplateCard({ preset, index }: { preset: (typeof FEATURED_PRESETS)[number]; index: number }) {
  const asset = getReadyPresetDemoAsset(preset.id);

  return (
    <Link className={`template-card template-card--${preset.accent}`} href={`/booth?preset=${preset.id}`} prefetch={false}>
      <div className="template-card__copy">
        <h3>{preset.name}</h3>
        <p>{preset.description}</p>
        <span className="template-card__arrow" aria-hidden="true">→</span>
      </div>
      {asset ? (
        <div className={`mini-strip mini-strip--${index + 1}`} aria-label={asset.alt}>
          <PresetDemoMedia presetId={preset.id} sizes="76px" />
        </div>
      ) : (
        <div className={`mini-strip mini-strip--${index + 1}`} aria-hidden="true">
          <i>◕‿◕</i><i>◕ᴗ◕</i><i>◕‿◕</i>
        </div>
      )}
    </Link>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <BrandLink />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#templates">Templates</a>
          <Link href="/layouts" prefetch={false}>Layouts</Link>
          <Link href="/online-photobooth" prefetch={false}>Booth</Link>
          <Link href="/photo-strip-maker" prefetch={false}>Photo Strip</Link>
          <Link href="/korean-photobooth" prefetch={false}>Korean Booth</Link>
        </nav>
        <Link className="header-cta" href="/booth?preset=classic-booth" prefetch={false}>Start Booth ✦</Link>
        <a className="menu-button" href="#templates" aria-label="Jump to templates">☰</a>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <Sparkle className="hero-sparkle hero-sparkle--one" />
          <span className="hero-heart hero-heart--one" aria-hidden="true">♡</span>
          <h1>Your cute<br />online photobooth</h1>
          <p className="hero-description">
            Snap photo strips instantly in your browser. Add filters and frames, then download or share with your favorite people. <span aria-hidden="true">♡</span>
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/booth?preset=classic-booth" prefetch={false}>Start Booth ✦</Link>
            <Link className="secondary-button" href="/layouts" prefetch={false}>Choose a look</Link>
          </div>
          <div className="benefit-row" aria-label="PicToFu benefits">
            <span>☁ <b>No app needed</b></span>
            <span>▣ <b>Private by design</b></span>
            <span>⇩ <b>Free download</b></span>
          </div>
        </div>
        <div className="hero-demo"><HomeBoothPreview /></div>
      </section>

      <section className="templates-section" id="templates" aria-labelledby="popular-templates-title">
        <div className="section-heading">
          <h2 id="popular-templates-title"><span aria-hidden="true">✦</span> Popular Templates</h2>
          <Link href="/layouts" prefetch={false}>Explore all layouts →</Link>
        </div>
        <div className="template-scroller">
          {FEATURED_PRESETS.map((preset, index) => <TemplateCard key={preset.id} preset={preset} index={index} />)}
        </div>
      </section>

      <section className="privacy-note">
        <span className="privacy-note__icon" aria-hidden="true">▣</span>
        <div>
          <h2>Your photos stay with you.</h2>
          <p>PicToFu processes camera frames and photo strips in your browser. No account required.</p>
        </div>
        <Link href="/privacy" prefetch={false}>Read our privacy policy →</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
