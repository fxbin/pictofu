import { filterCssValue, type FilterId } from "@/lib/filter-styles";
import { getFrameStyle, type FrameId } from "@/lib/frame-styles";
import type { BoothPreset } from "@/lib/presets";

type LayoutId = BoothPreset["layoutId"];

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

function drawHeart(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 0.5,
) {
  context.save();
  context.translate(x, y);
  context.scale(size / 24, size / 24);
  context.beginPath();
  context.moveTo(0, 7);
  context.bezierCurveTo(-12, -1, -13, -12, -5, -13);
  context.bezierCurveTo(-1, -13, 0, -9, 0, -7);
  context.bezierCurveTo(0, -9, 1, -13, 5, -13);
  context.bezierCurveTo(13, -12, 12, -1, 0, 7);
  context.closePath();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function drawSparkle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha = 0.55,
) {
  context.save();
  context.translate(x, y);
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = Math.max(2, radius * 0.12);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, -radius);
  context.lineTo(0, radius);
  context.moveTo(-radius, 0);
  context.lineTo(radius, 0);
  context.moveTo(-radius * 0.55, -radius * 0.55);
  context.lineTo(radius * 0.55, radius * 0.55);
  context.moveTo(radius * 0.55, -radius * 0.55);
  context.lineTo(-radius * 0.55, radius * 0.55);
  context.stroke();
  context.restore();
}

function drawFilmPerforations(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  alpha: number,
) {
  context.save();
  context.fillStyle = color;
  context.globalAlpha = alpha;
  const holeWidth = Math.max(12, Math.round(width * 0.012));
  const holeHeight = holeWidth * 1.55;
  const xInset = Math.max(9, Math.round(width * 0.012));
  const gap = holeHeight * 1.05;
  for (let y = 22; y < height - 72; y += holeHeight + gap) {
    context.beginPath();
    context.roundRect(xInset, y, holeWidth, holeHeight, holeWidth * 0.25);
    context.roundRect(width - xInset - holeWidth, y, holeWidth, holeHeight, holeWidth * 0.25);
    context.fill();
  }
  context.restore();
}

function paintFrameSurface(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameId: FrameId,
) {
  const frame = getFrameStyle(frameId);
  if (frameId === "chrome") {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f6f8ff");
    gradient.addColorStop(0.2, "#cfd6ea");
    gradient.addColorStop(0.42, "#f4d8ef");
    gradient.addColorStop(0.62, "#c8e7e8");
    gradient.addColorStop(0.82, "#d8d1ee");
    gradient.addColorStop(1, "#ffffff");
    context.fillStyle = gradient;
  } else {
    context.fillStyle = frame.background;
  }
  context.fillRect(0, 0, width, height);
}

function drawFrameDecorations(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameId: FrameId,
) {
  const frame = getFrameStyle(frameId);

  if (frameId === "white") {
    context.save();
    context.strokeStyle = frame.ink;
    context.globalAlpha = 0.13;
    context.lineWidth = Math.max(2, width * 0.002);
    context.strokeRect(18, 18, width - 36, height - 36);
    context.restore();
    return;
  }

  if (frameId === "pink") {
    drawHeart(context, 25, 26, 22, frame.ink, 0.38);
    drawHeart(context, width - 25, 48, 17, frame.ink, 0.28);
    drawHeart(context, 25, height - 86, 16, frame.ink, 0.26);
    return;
  }

  if (frameId === "lilac") {
    drawSparkle(context, 25, 25, 11, frame.ink, 0.42);
    drawSparkle(context, width - 26, 54, 9, frame.ink, 0.34);
    drawSparkle(context, 25, height - 88, 8, frame.ink, 0.28);
    return;
  }

  if (frameId === "mint") {
    context.save();
    context.strokeStyle = frame.ink;
    context.globalAlpha = 0.28;
    context.lineWidth = Math.max(2, width * 0.0025);
    context.beginPath();
    context.arc(24, 30, 10, 0.1, Math.PI * 1.65);
    context.arc(width - 25, 62, 8, Math.PI * 0.3, Math.PI * 1.9);
    context.arc(27, height - 86, 7, Math.PI * 0.05, Math.PI * 1.45);
    context.stroke();
    context.restore();
    return;
  }

  if (frameId === "black") {
    drawFilmPerforations(context, width, height, "#f5efe6", 0.62);
    return;
  }

  if (frameId === "film") {
    drawFilmPerforations(context, width, height, "#51392a", 0.42);
    context.save();
    context.strokeStyle = "#5d402c";
    context.globalAlpha = 0.13;
    context.lineWidth = 2;
    for (let y = 35; y < height - 80; y += 83) {
      context.beginPath();
      context.moveTo(31, y);
      context.lineTo(width - 31, y + 5);
      context.stroke();
    }
    context.restore();
    return;
  }

  if (frameId === "chrome") {
    context.save();
    context.globalAlpha = 0.2;
    const band = context.createLinearGradient(0, 0, width, 0);
    band.addColorStop(0, "rgba(255,255,255,0)");
    band.addColorStop(0.5, "#ffffff");
    band.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = band;
    context.translate(width * 0.12, 0);
    context.rotate(-0.16);
    context.fillRect(0, -height * 0.1, width * 0.13, height * 1.3);
    context.fillRect(width * 0.57, -height * 0.1, width * 0.08, height * 1.3);
    context.restore();
    drawSparkle(context, 26, 27, 12, frame.ink, 0.42);
    drawSparkle(context, width - 27, 55, 9, frame.ink, 0.34);
  }
}

function drawBranding(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameId: FrameId,
  layoutId: LayoutId,
) {
  const frame = getFrameStyle(frameId);
  const baseline = height - (layoutId === "polaroid" ? 105 : 55);
  context.save();
  context.fillStyle = frame.ink;
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

  const frame = getFrameStyle(input.frameId);
  paintFrameSurface(context, canvas.width, canvas.height, input.frameId);
  drawFrameDecorations(context, canvas.width, canvas.height, input.frameId);

  images.forEach((image, index) => {
    drawRoundedPhoto(
      context,
      image,
      geometry.rects[index],
      input.filterId,
      frame.cell,
      input.photoCrops?.[index],
    );
  });
  drawBranding(context, canvas.width, canvas.height, input.frameId, input.layoutId);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => (nextBlob ? resolve(nextBlob) : reject(new Error("PNG export failed.")),
      "image/png",
    );
  });

  return { blob, width: canvas.width, height: canvas.height };
}
