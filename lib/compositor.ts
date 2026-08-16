import { filterCssValue, type FilterId } from "@/lib/filter-styles";
import type { BoothPreset } from "@/lib/presets";

type LayoutId = BoothPreset["layoutId"];
type FrameId = BoothPreset["frameId"];

export type PhotoCrop = {
  x: number;
  y: number;
  zoom: number;
};

export type ComposeStripInput = {
  photoUrls: string[];
  photoCrops?: Array<PhotoCrop | undefined>;
  layoutId: LayoutId;
  filterId: FilterId;
  frameId: FrameId;
};

export type ComposeStripResult = {
  blob: Blob;
  width: number;
  height: number;
};

type Rect = { x: number; y: number; width: number; height: number };
type SourceCrop = { sx: number; sy: number; sw: number; sh: number };

const FRAME_COLORS: Record<FrameId, { background: string; ink: string; cell: string }> = {
  cream: { background: "#fff1df", ink: "#654d47", cell: "#fffaf5" },
  pink: { background: "#ffdce6", ink: "#805564", cell: "#fff8fa" },
  lilac: { background: "#eadfff", ink: "#655278", cell: "#fbf8ff" },
  mint: { background: "#dff3ed", ink: "#466d64", cell: "#f8fffc" },
};

export function shotTargetForLayout(layoutId: LayoutId): number {
  switch (layoutId) {
    case "strip-3":
      return 3;
    case "polaroid":
      return 1;
    case "strip-4":
    case "grid-4":
    default:
      return 4;
  }
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("A captured photo could not be loaded."));
    image.src = url;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultCoverCrop(imageWidth: number, imageHeight: number, rect: Rect): SourceCrop {
  const sourceRatio = imageWidth / imageHeight;
  const targetRatio = rect.width / rect.height;

  if (sourceRatio > targetRatio) {
    const sourceWidth = imageHeight * targetRatio;
    return {
      sx: (imageWidth - sourceWidth) / 2,
      sy: 0,
      sw: sourceWidth,
      sh: imageHeight,
    };
  }

  const sourceHeight = imageWidth / targetRatio;
  return {
    sx: 0,
    sy: (imageHeight - sourceHeight) / 2,
    sw: imageWidth,
    sh: sourceHeight,
  };
}

/**
 * Converts normalized Review controls into a safe source rectangle.
 *
 * x/y are normalized to [-1, 1], where 0 is centered and the extremes pan to
 * the furthest valid source edge. zoom is clamped to [1, 2.5]. Because the
 * crop always stays inside the original image, the compositor can never expose
 * an empty canvas area.
 */
export function resolvePhotoCrop(
  imageWidth: number,
  imageHeight: number,
  rect: Rect,
  crop?: PhotoCrop,
): SourceCrop {
  const base = defaultCoverCrop(imageWidth, imageHeight, rect);
  if (!crop) return base;

  const zoom = clamp(Number.isFinite(crop.zoom) ? crop.zoom : 1, 1, 2.5);
  const panX = clamp(Number.isFinite(crop.x) ? crop.x : 0, -1, 1);
  const panY = clamp(Number.isFinite(crop.y) ? crop.y : 0, -1, 1);
  const sw = base.sw / zoom;
  const sh = base.sh / zoom;
  const centeredSx = (imageWidth - sw) / 2;
  const centeredSy = (imageHeight - sh) / 2;
  const maxOffsetX = Math.max(0, centeredSx);
  const maxOffsetY = Math.max(0, centeredSy);

  return {
    sx: clamp(centeredSx + panX * maxOffsetX, 0, imageWidth - sw),
    sy: clamp(centeredSy + panY * maxOffsetY, 0, imageHeight - sh),
    sw,
    sh,
  };
}

function drawRoundedPhoto(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  rect: Rect,
  filterId: FilterId,
  cellColor: string,
  crop?: PhotoCrop,
) {
  const radius = Math.min(34, rect.width * 0.035);
  context.save();
  context.fillStyle = cellColor;
  context.beginPath();
  context.roundRect(rect.x - 8, rect.y - 8, rect.width + 16, rect.height + 16, radius + 6);
  context.fill();

  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
  context.clip();
  context.filter = filterCssValue(filterId);
  const source = resolvePhotoCrop(image.naturalWidth, image.naturalHeight, rect, crop);
  context.drawImage(
    image,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
  );
  context.restore();
}

function layoutGeometry(layoutId: LayoutId, photoCount: number) {
  const count = Math.max(1, Math.min(photoCount, shotTargetForLayout(layoutId)));

  if (layoutId === "grid-4") {
    const width = 1600;
    const margin = 58;
    const gap = 34;
    const cell = Math.floor((width - margin * 2 - gap) / 2);
    const footer = 130;
    const rows = Math.ceil(count / 2);
    const height = margin + rows * cell + Math.max(0, rows - 1) * gap + footer;
    const rects = Array.from({ length: count }, (_, index) => ({
      x: margin + (index % 2) * (cell + gap),
      y: margin + Math.floor(index / 2) * (cell + gap),
      width: cell,
      height: cell,
    }));
    return { width, height, rects, footer };
  }

  if (layoutId === "polaroid") {
    const width = 1200;
    const margin = 64;
    const footer = 250;
    const rects = [{ x: margin, y: margin, width: width - margin * 2, height: width - margin * 2 }];
    return { width, height: margin + rects[0].height + footer, rects, footer };
  }

  const width = 1080;
  const margin = 48;
  const gap = 28;
  const footer = 120;
  const cellWidth = width - margin * 2;
  const cellHeight = Math.round(cellWidth * 0.72);
  const height = margin + count * cellHeight + Math.max(0, count - 1) * gap + footer;
  const rects = Array.from({ length: count }, (_, index) => ({
    x: margin,
    y: margin + index * (cellHeight + gap),
    width: cellWidth,
    height: cellHeight,
  }));
  return { width, height, rects, footer };
}

function drawBranding(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameId: FrameId,
  layoutId: LayoutId,
) {
  const palette = FRAME_COLORS[frameId];
  const baseline = height - (layoutId === "polaroid" ? 105 : 55);
  context.save();
  context.fillStyle = palette.ink;
  context.textAlign = "center";
  context.font = `700 ${layoutId === "polaroid" ? 38 : 30}px ui-rounded, system-ui, sans-serif`;
  context.fillText("✦ PicToFu ♡", width / 2, baseline);
  context.font = "500 21px system-ui, sans-serif";
  context.globalAlpha = 0.68;
  context.fillText("pictofu.com", width / 2, baseline + 35);
  context.restore();
}

export async function composePhotoStrip(input: ComposeStripInput): Promise<ComposeStripResult> {
  if (input.photoUrls.length === 0) {
    throw new Error("Capture at least one photo before exporting.");
  }

  const target = shotTargetForLayout(input.layoutId);
  const urls = input.photoUrls.slice(0, target);
  if (urls.length < target) {
    throw new Error(`This layout needs ${target} captured photo${target === 1 ? "" : "s"}.`);
  }

  const images = await Promise.all(urls.map(loadImage));
  const geometry = layoutGeometry(input.layoutId, images.length);
  const canvas = document.createElement("canvas");
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas export is unavailable in this browser.");

  const palette = FRAME_COLORS[input.frameId];
  context.fillStyle = palette.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach((image, index) => {
    drawRoundedPhoto(
      context,
      image,
      geometry.rects[index],
      input.filterId,
      palette.cell,
      input.photoCrops?.[index],
    );
  });
  drawBranding(context, canvas.width, canvas.height, input.frameId, input.layoutId);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => (nextBlob ? resolve(nextBlob) : reject(new Error("PNG export failed."))),
      "image/png",
    );
  });

  return { blob, width: canvas.width, height: canvas.height };
}
