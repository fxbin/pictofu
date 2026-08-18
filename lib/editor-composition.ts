import type { StickerInstance } from "@/lib/stickers";

export type PhotoRatio = "auto" | "1:1" | "4:3" | "3:4";

export type EditorComposition = {
  photoRatio: PhotoRatio;
  stickers: StickerInstance[];
  presetId: string;
};

const DEFAULT_COMPOSITION: EditorComposition = {
  photoRatio: "auto",
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

export function setCompositionPhotoRatio(photoRatio: PhotoRatio) {
  if (composition.photoRatio === photoRatio) return;
  publish({ ...composition, photoRatio });
}

export function setCompositionStickers(stickers: StickerInstance[]) {
  publish({ ...composition, stickers: stickers.map((sticker) => ({ ...sticker })) });
}

export function setCompositionPreset(presetId: string) {
  if (composition.presetId === presetId) return;
  // Sticker packs are preset-aware; changing template deliberately clears the
  // old pack. The composition ratio remains because it is a strip-level choice.
  publish({ ...composition, presetId, stickers: [] });
}

export function resetEditorComposition() {
  publish(DEFAULT_COMPOSITION);
}

export function ratioValue(photoRatio: PhotoRatio) {
  if (photoRatio === "1:1") return 1;
  if (photoRatio === "4:3") return 4 / 3;
  if (photoRatio === "3:4") return 3 / 4;
  return null;
}
