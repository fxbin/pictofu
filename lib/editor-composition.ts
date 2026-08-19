import type { StickerInstance } from "@/lib/stickers";

export type EditorComposition = {
  stickers: StickerInstance[];
  presetId: string;
};

const DEFAULT_COMPOSITION: EditorComposition = {
  stickers: [],
  presetId: "",
};

let composition: EditorComposition = DEFAULT_COMPOSITION;
const listeners = new Set<() => void>();

function publish(next: EditorComposition) {
  composition = next;
  listeners.forEach((listener) => listener());
}

export function getEditorCompositionSnapshot() {
  return composition;
}

export function getEditorCompositionServerSnapshot() {
  return DEFAULT_COMPOSITION;
}

export function subscribeEditorComposition(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setCompositionStickers(stickers: StickerInstance[]) {
  publish({ ...composition, stickers: stickers.map((sticker) => ({ ...sticker })) });
}

export function setCompositionPreset(presetId: string) {
  if (composition.presetId === presetId) return;
  // Sticker packs are preset-aware; changing template deliberately clears the old pack.
  publish({ ...composition, presetId, stickers: [] });
}

export function resetEditorComposition() {
  publish(DEFAULT_COMPOSITION);
}
