import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { FEATURED_PRESETS } from "@/lib/presets";

function Sparkle({ className = "" }: { className?: string }) {
  return <span className={`sparkle ${className}`} aria-hidden="true">✦</span>;
}

function DemoStrip() {
  return (
    <div className="demo-strip" aria-label="Example four-photo strip">
      {["peace", "smile", "wink", "heart"].map((pose, index) => (
        <div className={`demo-strip__photo demo-strip__photo--${index + 1}`} key={pose}>
          <span className="demo-face" aria-hidden="true">◕‿◕</span>
        </div>
      ))}
      <div className="demo-strip__footer">✦ PicTofu ♡</div>
    </div>
  );
}

function BoothPreview() {
  return (
    <div className="booth-preview" aria-label="PicTofu booth preview">
      <div className="booth-preview__topbar">
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="status-pill">✨ Ready when you are!</span>
        <span className="camera-pill">▣ Camera</span>
      </div>
      <div className="booth-preview__body">
        <div className="preview-tools" aria-hidden="true">
          <span><b>3:4</b><small>Ratio</small></span>
          <span><b>◷</b><small>Timer</small></span>
          <span><b>ϟ</b><small>Flash</small></span>
          <span><b>↻</b><small>Flip</small></span>
        </div>
        <div className="camera-stage" aria-hidden="true">
          <div className="camera-stage__poster">
            <span className="camera-stage__hair" />
            <span className="camera-stage__face">◕‿◕</span>
            <span className="camera-stage__hand">✌</span>
          </div>
          <div className="countdown-ring">3</div>
          <span className="camera-doodle camera-doodle--one">♡</span>
          <span className="camera-doodle camera-doodle--two">✦</span>
        </div>
        <DemoStrip />
      </div>
      <div className="booth-preview__bottom">
        <div className="editor-preview">
          <div className="editor-tabs" aria-hidden="true">
            <span>▦ Layouts</span><span className="is-active">◉ Filters</span><span>▢ Frames</span><span>♡ Stickers</span>
          </div>
          <div className="filter-row" aria-hidden="true">
            {["Original", "B&W", "Warm", "Vintage", "Y2K"].map((filter, index) => (
              <span className={index === 0 ? "is-selected" : ""} key={filter}>
                <i className={`filter-swatch filter-swatch--${index + 1}`} />
                <small>{filter}</small>
              </span>
            ))}
          </div>
        </div>
        <Link className="gradient-button" href="/booth?preset=korean-date">Open Booth ✦</Link>
      </div>
    </div>
  );
}

function TemplateCard({ preset, index }: { preset: (typeof FEATURED_PRESETS)[number]; index: number }) {
  return (
    <Link className={`template-card template-card--${preset.accent}`} href={`/booth?preset=${preset.id}`}>
      <div className="template-card__copy">
        <h3>{preset.name}</h3>
        <p>{preset.description}</p>
        <span className="template-card__arrow" aria-hidden="true">→</span>
      </div>
      <div className={`mini-strip mini-strip--${index + 1}`} aria-hidden="true">
        <i>◕‿◕</i><i>◕ᴗ◕</i><i>◕‿◕</i>
      </div>
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
          <Link href="/layouts">Layouts</Link>
          <Link href="/online-photobooth">Booth</Link>
          <Link href="/photo-strip-maker">Photo Strip</Link>
          <Link href="/korean-photobooth">Korean Booth</Link>
        </nav>
        <Link className="header-cta" href="/layouts">Start Booth ✦</Link>
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
            <Link className="primary-button" href="/layouts">Start Booth ✦</Link>
            <a className="secondary-button" href="#templates">Try Templates</a>
          </div>
          <div className="benefit-row" aria-label="PicTofu benefits">
            <span>☁ <b>No app needed</b></span>
            <span>▣ <b>Private by design</b></span>
            <span>⇩ <b>Free download</b></span>
          </div>
        </div>
        <div className="hero-demo"><BoothPreview /></div>
      </section>

      <section className="templates-section" id="templates" aria-labelledby="popular-templates-title">
        <div className="section-heading">
          <h2 id="popular-templates-title"><span aria-hidden="true">✦</span> Popular Templates</h2>
          <Link href="/layouts">Explore all layouts →</Link>
        </div>
        <div className="template-scroller">
          {FEATURED_PRESETS.map((preset, index) => <TemplateCard key={preset.id} preset={preset} index={index} />)}
        </div>
      </section>

      <section className="privacy-note">
        <span className="privacy-note__icon" aria-hidden="true">▣</span>
        <div>
          <h2>Your photos stay with you.</h2>
          <p>PicTofu’s MVP processes camera frames and photo strips in your browser. No account required.</p>
        </div>
        <Link href="/privacy">Read our privacy policy →</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
