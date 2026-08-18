"use client";

import { useSyncExternalStore } from "react";
import type { CSSProperties, PointerEventHandler } from "react";
import {
  getEditorCompositionServerSnapshot,
  getEditorCompositionSnapshot,
  ratioValue,
  subscribeEditorComposition,
} from "@/lib/editor-composition";
import {
  normalizePhotoAdjustment,
  resolvePhotoTransform,
  type PhotoAdjustment,
} from "@/lib/compositor";
import { PhotoPreview } from "./photo-preview";

type PhotoEditorCanvasProps = {
  url: string;
  imageWidth: number;
  imageHeight: number;
  adjustment?: PhotoAdjustment;
  targetRatio: number;
  alt: string;
  disabled?: boolean;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onLostPointerCapture: PointerEventHandler<HTMLDivElement>;
};

const CONTEXT_PADDING = 1.18;
const MAX_CONTEXT_MULTIPLE = 2.2;

function editorCanvasGeometry(
  imageWidth: number,
  imageHeight: number,
  cropRatio: number,
  adjustment?: PhotoAdjustment,
) {
  const current = normalizePhotoAdjustment(adjustment);
  const cropHeight = 100;
  const cropWidth = Math.max(0.1, cropRatio) * cropHeight;

  // Size the surrounding workspace from the source photo at baseline zoom.
  // Quarter-turn rotation changes the natural context orientation, while fine
  // straighten remains a crop adjustment and should not resize the whole UI.
  const baseline = resolvePhotoTransform(
    imageWidth,
    imageHeight,
    cropWidth,
    cropHeight,
    {
      ...current,
      panX: 0,
      panY: 0,
      zoom: 1,
      straighten: 0,
    },
  );
  const radians = (baseline.angleDegrees * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const sourceBoxWidth = baseline.drawWidth * cosine + baseline.drawHeight * sine;
  const sourceBoxHeight = baseline.drawWidth * sine + baseline.drawHeight * cosine;

  const contextWidth = Math.min(
    Math.max(cropWidth, sourceBoxWidth),
    cropWidth * MAX_CONTEXT_MULTIPLE,
  );
  const contextHeight = Math.min(
    Math.max(cropHeight, sourceBoxHeight),
    cropHeight * MAX_CONTEXT_MULTIPLE,
  );
  const canvasWidth = contextWidth * CONTEXT_PADDING;
  const canvasHeight = contextHeight * CONTEXT_PADDING;

  return {
    canvasRatio: canvasWidth / canvasHeight,
    cropWidthPercent: (cropWidth / canvasWidth) * 100,
    cropHeightPercent: (cropHeight / canvasHeight) * 100,
  };
}

export function PhotoEditorCanvas({
  url,
  imageWidth,
  imageHeight,
  adjustment,
  targetRatio,
  alt,
  disabled = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
}: PhotoEditorCanvasProps) {
  const composition = useSyncExternalStore(
    subscribeEditorComposition,
    getEditorCompositionSnapshot,
    getEditorCompositionServerSnapshot,
  );
  const customRatio = ratioValue(composition.photoRatio);
  const effectiveRatio = customRatio ?? targetRatio;
  const geometry = editorCanvasGeometry(
    imageWidth,
    imageHeight,
    effectiveRatio,
    adjustment,
  );
  const canvasStyle: CSSProperties = {
    aspectRatio: String(geometry.canvasRatio),
  };
  const cropStyle: CSSProperties = {
    width: `${geometry.cropWidthPercent}%`,
    height: `${geometry.cropHeightPercent}%`,
  };

  return (
    <div className="review-editor-canvas" style={canvasStyle}>
      <div
        className="review-editor-canvas__crop"
        style={cropStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onLostPointerCapture}
        aria-label="Final crop. Drag to reposition the photo and pinch to zoom."
        aria-disabled={disabled}
      >
        <PhotoPreview
          url={url}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          adjustment={adjustment}
          targetRatio={targetRatio}
          alt={alt}
        />
        <span className="review-editor-canvas__crop-mask" aria-hidden="true" />
        <span className="review-editor-canvas__crop-label" aria-hidden="true">Final crop</span>
      </div>
      <span className="review-editor-canvas__hint" aria-hidden="true">Drag inside frame · pinch to zoom</span>
    </div>
  );
}
