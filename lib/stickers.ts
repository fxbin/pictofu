export type StickerPackId = "korean-date" | "couple-date" | "y2k-summer" | "best-friends";

export type StickerDefinition = {
  id: string;
  packId: StickerPackId;
  label: string;
  glyph: string;
  tone: string;
  weight?: "normal" | "bold";
};

export type StickerInstance = {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
};

const STICKERS: StickerDefinition[] = [
  { id: "kr-heart", packId: "korean-date", label: "Heart", glyph: "♡", tone: "#e45d7b", weight: "bold" },
  { id: "kr-bow", packId: "korean-date", label: "Bow", glyph: "୨୧", tone: "#d85f89" },
  { id: "kr-sparkle", packId: "korean-date", label: "Sparkle", glyph: "✦", tone: "#c76987", weight: "bold" },
  { id: "kr-love", packId: "korean-date", label: "Love", glyph: "LOVE", tone: "#bd526f", weight: "bold" },

  { id: "cp-hearts", packId: "couple-date", label: "Hearts", glyph: "♡♡", tone: "#e35b72", weight: "bold" },
  { id: "cp-xoxo", packId: "couple-date", label: "XOXO", glyph: "XOXO", tone: "#d85973", weight: "bold" },
  { id: "cp-kiss", packId: "couple-date", label: "Kiss", glyph: "KISS", tone: "#b94d67", weight: "bold" },
  { id: "cp-date", packId: "couple-date", label: "Our date", glyph: "OUR DATE", tone: "#c46077", weight: "bold" },

  { id: "y2k-star", packId: "y2k-summer", label: "Chrome star", glyph: "☆", tone: "#6c6fe7", weight: "bold" },
  { id: "y2k-heart", packId: "y2k-summer", label: "Pixel heart", glyph: "♥", tone: "#dc64b7", weight: "bold" },
  { id: "y2k-disc", packId: "y2k-summer", label: "Disc", glyph: "◉", tone: "#5b8ca8", weight: "bold" },
  { id: "y2k-2000", packId: "y2k-summer", label: "2000s", glyph: "2000s", tone: "#7768d8", weight: "bold" },

  { id: "bff-bff", packId: "best-friends", label: "BFF", glyph: "BFF", tone: "#8e67c2", weight: "bold" },
  { id: "bff-smile", packId: "best-friends", label: "Smiley", glyph: "☺", tone: "#7865b6", weight: "bold" },
  { id: "bff-stars", packId: "best-friends", label: "Stars", glyph: "★", tone: "#9e72c2", weight: "bold" },
  { id: "bff-wave", packId: "best-friends", label: "Doodle", glyph: "~☆~", tone: "#8161ae", weight: "bold" },
];

const SUPPORTED_PACKS = new Set<StickerPackId>([
  "korean-date",
  "couple-date",
  "y2k-summer",
  "best-friends",
]);

export function stickerPackForPreset(presetId: string): StickerDefinition[] {
  if (!SUPPORTED_PACKS.has(presetId as StickerPackId)) return [];
  return STICKERS.filter((sticker) => sticker.packId === presetId);
}

export function getStickerDefinition(stickerId: string): StickerDefinition | undefined {
  return STICKERS.find((sticker) => sticker.id === stickerId);
}

export function normalizeStickerInstance(sticker: StickerInstance): StickerInstance {
  return {
    ...sticker,
    x: Math.min(0.96, Math.max(0.04, Number.isFinite(sticker.x) ? sticker.x : 0.5)),
    y: Math.min(0.96, Math.max(0.04, Number.isFinite(sticker.y) ? sticker.y : 0.5)),
    scale: Math.min(2, Math.max(0.55, Number.isFinite(sticker.scale) ? sticker.scale : 1)),
    rotation: Math.min(45, Math.max(-45, Number.isFinite(sticker.rotation) ? sticker.rotation : 0)),
    zIndex: Math.max(1, Math.min(32, Math.round(Number.isFinite(sticker.zIndex) ? sticker.zIndex : 1))),
  };
}
