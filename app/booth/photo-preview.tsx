"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { emitProductEvent, type EditTool } from "@/lib/analytics";
import {
  getPhotoFramingRatio,
  getPhotoFramingServerVersion,
  getPhotoFramingVersion,
  ratioValue,
  subscribePhotoFraming,
} from "@/lib/photo-framing";
import {
  normalizePhotoAdjustment,
  resolvePhotoTransform,
  type PhotoAdjustment,
} from "@/lib/compositor";

type PhotoPreviewProps = {
  url: string;
  imageWidth: number;
  imageHeight: number;
  adjustment?: PhotoAdjustment;
  targetRatio: number;
  alt?: string;
  filter?: string;
  className?: string;
};

function changedTools(previous: PhotoAdjustment, next: PhotoAdjustment): EditTool[] {
  const tools: EditTool[] = [];
  if (previous.panX !== next.panX || previous.panY !== next.panY) tools.push("pan");
  if (previous.zoom !== next.zoom) tools.push("zoom");
  if (previous.rotation !== next.rotation) tools.push("rotate");
  if (previous.straighten !== next.straighten) tools.push("straighten");
  if (previous.flipX !== next.flipX) tools.push("flip");
  return tools;
}

export function PhotoPreview({ url, imageWidth, imageHeight, adjustment, targetRatio, alt = "", filter, className }: PhotoPreviewProps) {
  useSyncExternalStore(subscribePhotoFraming, getPhotoFramingVersion, getPhotoFramingServerVersion);
  const framing = getPhotoFramingRatio(url);
  const currentAdjustment = normalizePhotoAdjustment(adjustment);
  const { panX, panY, zoom, rotation, straighten, flipX } = currentAdjustment;
  const previousAdjustment = useRef(currentAdjustment);

  useEffect(() => {
    const previous = previousAdjustment.current;
    const next: PhotoAdjustment = { panX, panY, zoom, rotation, straighten, flipX };
    previousAdjustment.current = next;
    changedTools(previous, next).forEach((tool) => emitProductEvent("editor_tool_used", { edit_tool: tool }));
  }, [panX, panY, zoom, rotation, straighten, flipX]);

  const customRatio = ratioValue(framing);
  const effectiveRatio = customRatio ?? targetRatio;
  const viewportHeight = 100;
  const viewportWidth = Math.max(0.1, effectiveRatio) * viewportHeight;
  const transform = resolvePhotoTransform(
    imageWidth,
    imageHeight,
    viewportWidth,
    viewportHeight,
    currentAdjustment,
  );

  const outerStyle: CSSProperties = {
    width: `${(transform.drawWidth / viewportWidth) * 100}%`,
    height: `${(transform.drawHeight / viewportHeight) * 100}%`,
    left: "50%",
    top: "50%",
    transform: `translate(-50%, -50%) rotate(${transform.angleDegrees}deg) scaleX(${transform.flipX ? -1 : 1})`,
  };
  const innerStyle: CSSProperties = {
    transform: `translate(${(-transform.panX / transform.drawWidth) * 100}%, ${(-transform.panY / transform.drawHeight) * 100}%)`,
  };

  return (
    <span className={`photo-preview ${className ?? ""}`} data-photo-framing={framing} aria-hidden={alt ? undefined : true}>
      <span className="photo-preview__transform" style={outerStyle}>
        <span className="photo-preview__pan" style={innerStyle}>
          <img src={url} alt={alt} draggable={false} style={{ filter }} />
        </span>
      </span>
    </span>
  );
}
