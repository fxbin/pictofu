import { composePhotoStrip, type ComposeStripInput, type ComposeStripResult } from "@/lib/compositor";
import { getStickerDefinition, normalizeStickerInstance, type StickerInstance } from "@/lib/stickers";

export type ComposeStickeredStripInput = ComposeStripInput & {
  stickers?: StickerInstance[];
};

async function loadBlobImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Generated strip could not be decorated."));
      image.src = url;
    });
  } finally {
    // Revoke after the event loop so decoded image data remains usable by Canvas.
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function drawSticker(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  sticker: StickerInstance,
) {
  const definition = getStickerDefinition(sticker.stickerId);
  if (!definition) return;
  const next = normalizeStickerInstance(sticker);
  const baseSize = Math.max(38, Math.min(canvasWidth, canvasHeight) * 0.075);
  const size = baseSize * next.scale;

  context.save();
  context.translate(next.x * canvasWidth, next.y * canvasHeight);
  context.rotate((next.rotation * Math.PI) / 180);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${definition.weight === "bold" ? 900 : 700} ${size}px ui-rounded, system-ui, sans-serif`;
  context.lineJoin = "round";
  context.lineWidth = Math.max(3, size * 0.085);
  context.strokeStyle = "rgba(255,255,255,.92)";
  context.fillStyle = definition.tone;
  context.strokeText(definition.glyph, 0, 0);
  context.fillText(definition.glyph, 0, 0);
  context.restore();
}

export async function composeStickeredPhotoStrip(
  input: ComposeStickeredStripInput,
): Promise<ComposeStripResult> {
  const base = await composePhotoStrip(input);
  const stickers = (input.stickers ?? [])
    .map(normalizeStickerInstance)
    .sort((a, b) => a.zIndex - b.zIndex);
  if (stickers.length === 0) return base;

  const image = await loadBlobImage(base.blob);
  const canvas = document.createElement("canvas");
  canvas.width = base.width;
  canvas.height = base.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas sticker export is unavailable in this browser.");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  stickers.forEach((sticker) => drawSticker(context, canvas.width, canvas.height, sticker));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => nextBlob ? resolve(nextBlob) : reject(new Error("Sticker PNG export failed.")),
      "image/png",
    );
  });

  return { blob, width: base.width, height: base.height };
}
