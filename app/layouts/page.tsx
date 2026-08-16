import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { PresetDemoMedia } from "@/components/preset-demo-media";
import { SiteFooter } from "@/components/site-footer";
import { getReadyPresetDemoAsset } from "@/lib/demo-assets";
import { getFrameStyle } from "@/lib/frame-styles";
import { LAYOUT_DEMO_ASSETS, LAYOUT_DEMO_TOTAL_BYTES } from "@/lib/layout-demo-assets";
import { PRESETS } from "@/lib/presets";
import styles from "./layouts.module.css";

const LAYOUTS_DESCRIPTION =
  "Compare PicToFu photo strips, grids, three-cut looks and a Polaroid-style card before opening the camera. Pick a style, see the shot count, then start that preset instantly.";

export const metadata: Metadata = {
  title: { absolute: "Choose a Photo Booth Layout | PicToFu" },
  description: LAYOUTS_DESCRIPTION,
  alternates: { canonical: "https://pictofu.com/layouts" },
  openGraph: {
    title: "Choose a Photo Booth Layout | PicToFu",
    description: LAYOUTS_DESCRIPTION,
    url: "https://pictofu.com/layouts",
    siteName: "PicToFu",
    type: "website",
  },
};

type Geometry = "strip-4" | "strip-3" | "grid-4" | "polaroid";

const GEOMETRY_COPY: Record<Geometry, { label: string; short: string }> = {
  "strip-4": { label: "1 × 4 photo strip", short: "Four stacked moments" },
  "strip-3": { label: "1 × 3 photo strip", short: "A shorter keepsake" },
  "grid-4": { label: "2 × 2 photo grid", short: "Four equal frames" },
  polaroid: { label: "Polaroid-style card", short: "One framed memory" },
};

const EXPERIENCE_LINKS = [
  ["Korean", "/korean-photobooth"],
  ["Y2K", "/y2k-photobooth"],
  ["Vintage", "/vintage-photobooth"],
  ["Couple", "/couple-photobooth"],
  ["Best Friends", "/best-friend-photobooth"],
  ["Graduation", "/graduation-photobooth"],
] as const;

function GeometryPreview({ layout, shotCount }: { layout: Geometry; shotCount: number }) {
  const cells = layout === "polaroid" ? 1 : shotCount;
  const modifierClass = layout === "strip-4" ? undefined : styles[`preview_${layout}`];

  return (
    <div className={[styles.preview, modifierClass].filter(Boolean).join(" ")} aria-hidden="true">
      {Array.from({ length: cells }).map((_, index) => <span key={index}>{index + 1}</span>)}
      <small>PicToFu</small>
    </div>
  );
}

export default function LayoutsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandLink />
        <nav className={styles.nav} aria-label="Layout page navigation">
          <Link href="/">Home</Link>
          <Link href="/online-photobooth">Photobooth</Link>
          <Link href="/photo-strip-maker">Photo Strip</Link>
        </nav>
        <Link className={styles.headerCta} href="/booth">Open Booth ✦</Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>✦ Pick the outcome first</p>
        <h1>Choose your photo booth look</h1>
        <p>
          Layout is the geometry. A preset adds the filter, frame and mood. Pick the finished shape you want before PicToFu asks for camera access.
        </p>
        <div className={styles.heroChips} aria-label="Available layout geometries">
          <span>1 × 4 Strip</span><span>1 × 3 Strip</span><span>2 × 2 Grid</span><span>Polaroid</span>
        </div>
      </section>

      <section className={styles.demoGallery} aria-labelledby="layout-demo-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>Real output examples</p>
            <h2 id="layout-demo-title">Swipe through every shape</h2>
          </div>
          <span>{LAYOUT_DEMO_ASSETS.length} examples · ~{Math.round(LAYOUT_DEMO_TOTAL_BYTES / 1024)} KB total</span>
        </div>

        <div className={styles.demoTrack} aria-label="Real photo booth layout examples">
          {LAYOUT_DEMO_ASSETS.map((asset) => (
            <article className={styles.demoCard} key={asset.layoutId}>
              <div className={styles.demoStage}>
                <Image
                  className={styles.demoImage}
                  src={asset.src}
                  width={asset.width}
                  height={asset.height}
                  alt={asset.alt}
                  sizes="(max-width: 680px) 76vw, 260px"
                  unoptimized
                />
              </div>
              <div className={styles.demoCopy}>
                <strong>{asset.label}</strong>
                <span>{asset.note}</span>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.demoFootnote}>
          <p>These examples show the output geometry. Presets below add their own filter and frame mood.</p>
          <span aria-hidden="true">Swipe or scroll →</span>
        </div>
      </section>

      <section className={styles.chooser} aria-labelledby="choose-look-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>Current presets</p>
            <h2 id="choose-look-title">Start with a look you already understand</h2>
          </div>
          <span>{PRESETS.length} looks · no camera permission yet</span>
        </div>

        <div className={styles.grid}>
          {PRESETS.map((preset) => {
            const geometry = GEOMETRY_COPY[preset.layoutId];
            const demoAsset = getReadyPresetDemoAsset(preset.id);
            const frame = getFrameStyle(preset.frameId);

            return (
              <article className={`${styles.card} ${styles[`accent_${preset.accent}`]}`} key={preset.id}>
                <div className={styles.cardPreview}>
                  {demoAsset ? (
                    <PresetDemoMedia
                      presetId={preset.id}
                      sizes="(max-width: 680px) 58vw, 208px"
                      className={styles.presetDemoImage}
                      style={{ width: "auto", height: "208px", maxWidth: "100%" }}
                    />
                  ) : (
                    <GeometryPreview layout={preset.layoutId} shotCount={preset.shotCount} />
                  )}
                  <span className={styles.shotBadge}>
                    {preset.shotCount} {preset.shotCount === 1 ? "shot" : "shots"}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitleRow}>
                    <div>
                      <p>{geometry.short}</p>
                      <h3>{preset.name}</h3>
                    </div>
                    <span>{preset.filterId}</span>
                  </div>
                  <p className={styles.description}>{preset.description}</p>
                  <dl className={styles.meta}>
                    <div><dt>Layout</dt><dd>{geometry.label}</dd></div>
                    <div><dt>Frame</dt><dd>{frame.label}</dd></div>
                  </dl>
                  <Link className={styles.chooseButton} href={`/booth?preset=${preset.id}`}>
                    Choose this look <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.explainer} aria-labelledby="layout-vs-look-title">
        <div>
          <p className={styles.eyebrow}>Layout ≠ preset</p>
          <h2 id="layout-vs-look-title">One shape can have many moods</h2>
        </div>
        <div className={styles.explainerCopy}>
          <p><strong>Layout</strong> decides how your photos are arranged: a vertical strip, grid, or Polaroid-like card.</p>
          <p><strong>Preset</strong> starts that layout with a filter and frame, such as Korean Date, Y2K Summer or Vintage Film. You can still adjust compatible styling after capture.</p>
        </div>
      </section>

      <section className={styles.intentLinks} aria-labelledby="explore-styles-title">
        <div>
          <p className={styles.eyebrow}>Explore by mood</p>
          <h2 id="explore-styles-title">Not sure which look fits?</h2>
        </div>
        <div className={styles.linkGrid}>
          {EXPERIENCE_LINKS.map(([label, href]) => <Link key={href} href={href}>{label}<span>→</span></Link>)}
        </div>
      </section>

      <section className={styles.finalCta}>
        <p>Already know what you want?</p>
        <h2>Open the camera and make the strip.</h2>
        <Link href="/booth">Open PicToFu booth ✦</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
