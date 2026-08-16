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
    deliveryStatus: "pending",
    src: "/demo/presets/korean-date.webp",
    width: 300,
    height: 857,
    alt: "Couple posing through a warm four-photo Korean Date strip.",
  },
  "y2k-summer": {
    presetId: "y2k-summer",
    reviewStatus: "approved",
    deliveryStatus: "pending",
    src: "/demo/presets/y2k-summer.webp",
    width: 300,
    height: 857,
    alt: "Friends making playful flash-lit poses in a Y2K Summer photo strip.",
  },
  "couple-date": {
    presetId: "couple-date",
    reviewStatus: "approved",
    deliveryStatus: "pending",
    src: "/demo/presets/couple-date.webp",
    width: 300,
    height: 857,
    alt: "Couple sharing four relaxed poses in a blush Couple Date photo strip.",
  },
  "vintage-film": {
    presetId: "vintage-film",
    reviewStatus: "approved",
    deliveryStatus: "pending",
    src: "/demo/presets/vintage-film.webp",
    width: 300,
    height: 857,
    alt: "Portrait session shown as four warm faded Vintage Film frames.",
  },
  graduation: {
    presetId: "graduation",
    reviewStatus: "approved",
    deliveryStatus: "pending",
    src: "/demo/presets/graduation.webp",
    width: 300,
    height: 652,
    alt: "Graduate celebrating across a warm three-photo keepsake strip.",
  },
} satisfies Record<string, PresetDemoAsset>;

export function getPresetDemoAsset(presetId: string): PresetDemoAsset | undefined {
  return PRESET_DEMO_ASSETS[presetId as keyof typeof PRESET_DEMO_ASSETS];
}

export function getReadyPresetDemoAsset(presetId: string): PresetDemoAsset | undefined {
  const asset = getPresetDemoAsset(presetId);
  return asset?.deliveryStatus === "ready" ? asset : undefined;
}
