export type DemoAssetReviewStatus = "approved";
export type DemoAssetDeliveryStatus = "pending" | "ready";

export type PresetDemoAsset = {
  presetId: string;
  reviewStatus: DemoAssetReviewStatus;
  deliveryStatus: DemoAssetDeliveryStatus;
  src: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * Single source of truth for preset-specific static marketing examples.
 *
 * Owner visual approval and binary delivery are intentionally separate gates:
 * an approved image is not rendered publicly until its optimized WebP is in the
 * repository and deliveryStatus is promoted to `ready` in the same change.
 */
export const PRESET_DEMO_ASSETS = {
  "korean-date": {
    presetId: "korean-date",
    reviewStatus: "approved",
    deliveryStatus: "ready",
    src: "/demo/presets/korean-date.webp",
    width: 300,
    height: 857,
    alt: "Young woman posing in a soft pink Korean-style four-photo strip.",
  },
  "y2k-summer": {
    presetId: "y2k-summer",
    reviewStatus: "approved",
    deliveryStatus: "ready",
    src: "/demo/presets/y2k-summer.webp",
    width: 300,
    height: 300,
    alt: "Two friends posing in a colorful Y2K-inspired four-photo grid.",
  },
  "couple-date": {
    presetId: "couple-date",
    reviewStatus: "approved",
    deliveryStatus: "ready",
    src: "/demo/presets/couple-date.webp",
    width: 300,
    height: 300,
    alt: "Couple sharing playful and affectionate poses in a warm four-photo grid.",
  },
  "vintage-film": {
    presetId: "vintage-film",
    reviewStatus: "approved",
    deliveryStatus: "ready",
    src: "/demo/presets/vintage-film.webp",
    width: 300,
    height: 857,
    alt: "Young man shown in a warm faded vintage four-frame photo strip.",
  },
  graduation: {
    presetId: "graduation",
    reviewStatus: "approved",
    deliveryStatus: "ready",
    src: "/demo/presets/graduation.webp",
    width: 300,
    height: 375,
    alt: "Graduate smiling in a framed graduation portrait keepsake.",
  },
} satisfies Record<string, PresetDemoAsset>;

export function getPresetDemoAsset(presetId: string): PresetDemoAsset | undefined {
  return PRESET_DEMO_ASSETS[presetId as keyof typeof PRESET_DEMO_ASSETS];
}

export function getReadyPresetDemoAsset(presetId: string): PresetDemoAsset | undefined {
  const asset = getPresetDemoAsset(presetId);
  return asset?.deliveryStatus === "ready" ? asset : undefined;
}
