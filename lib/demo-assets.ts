export type DemoAssetStatus = "planned" | "candidate" | "approved";

export type DemoAsset = {
  presetId: string;
  stripSrc: string;
  cardSrc: string;
  alt: string;
  shotCount: 3 | 4;
  layout: "strip-4" | "strip-3" | "grid-4" | "polaroid";
  status: DemoAssetStatus;
  audienceNote: string;
};

/**
 * PicTofu demo assets are marketing/product examples only.
 * They must never be used as captured-session state and must remain separate
 * from browser-local user photos.
 *
 * Production rule:
 * - one strip = one consistent human session (same people, wardrobe, lighting)
 * - no competitor photos, celebrity/public-person likenesses, or unclear licenses
 * - published styling must be reproducible by the real PicTofu preset system
 * - global representation is evaluated across the whole set, not by binding
 *   one ethnicity to one visual style
 */
export const DEMO_ASSETS: DemoAsset[] = [
  {
    presetId: "classic-booth",
    stripSrc: "/demo/classic-booth/strip.webp",
    cardSrc: "/demo/classic-booth/card.webp",
    alt: "Classic four-photo PicTofu booth strip with four natural portrait poses",
    shotCount: 4,
    layout: "strip-4",
    status: "planned",
    audienceNote: "Solo young adult; neutral styling; first production target is a Black woman.",
  },
  {
    presetId: "korean-date",
    stripSrc: "/demo/korean-date/strip.webp",
    cardSrc: "/demo/korean-date/card.webp",
    alt: "Soft Korean-style four-cut PicTofu date photobooth strip",
    shotCount: 4,
    layout: "strip-4",
    status: "planned",
    audienceNote: "Mixed-ethnicity couple; Korean-inspired aesthetic without ethnicity locking.",
  },
  {
    presetId: "couple-date",
    stripSrc: "/demo/couple-date/strip.webp",
    cardSrc: "/demo/couple-date/card.webp",
    alt: "Warm four-photo PicTofu couple date photobooth strip",
    shotCount: 4,
    layout: "strip-4",
    status: "planned",
    audienceNote: "Couple session distinct from Korean Date; globally representative casting.",
  },
  {
    presetId: "y2k-summer",
    stripSrc: "/demo/y2k-summer/strip.webp",
    cardSrc: "/demo/y2k-summer/card.webp",
    alt: "Colorful Y2K four-photo PicTofu photobooth strip with playful flash poses",
    shotCount: 4,
    layout: "strip-4",
    status: "planned",
    audienceNote: "One or two globally representative young adults; flash/editorial energy.",
  },
  {
    presetId: "vintage-film",
    stripSrc: "/demo/vintage-film/strip.webp",
    cardSrc: "/demo/vintage-film/card.webp",
    alt: "Warm vintage-film four-photo PicTofu portrait strip",
    shotCount: 4,
    layout: "strip-4",
    status: "planned",
    audienceNote: "Solo portrait; different demographic profile from Classic Booth.",
  },
  {
    presetId: "best-friends",
    stripSrc: "/demo/best-friends/strip.webp",
    cardSrc: "/demo/best-friends/card.webp",
    alt: "Playful four-photo PicTofu best-friends grid with a diverse friend group",
    shotCount: 4,
    layout: "grid-4",
    status: "planned",
    audienceNote: "Two to three friends with visible, natural diversity in skin tone and hair texture.",
  },
  {
    presetId: "graduation",
    stripSrc: "/demo/graduation/strip.webp",
    cardSrc: "/demo/graduation/card.webp",
    alt: "Three-photo PicTofu graduation keepsake strip with celebratory poses",
    shotCount: 3,
    layout: "strip-3",
    status: "planned",
    audienceNote: "One or two graduates; casting should broaden the aggregate production set.",
  },
];

export const DEMO_ASSET_MAP = new Map(DEMO_ASSETS.map((asset) => [asset.presetId, asset]));

export function getDemoAsset(presetId: string) {
  return DEMO_ASSET_MAP.get(presetId);
}
