import type { CSSProperties } from "react";
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

export function PhotoPreview({
  url,
  imageWidth,
  imageHeight,
  adjustment,
  targetRatio,
  alt = "",
  filter,
  className,
}: PhotoPreviewProps) {
  const viewportHeight = 100;
  const viewportWidth = Math.max(0.1, targetRatio) * viewportHeight;
  const next = normalizePhotoAdjustment(adjustment);
  const transform = resolvePhotoTransform(
    imageWidth,
    imageHeight,
    viewportWidth,
    viewportHeight,
    next,
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
    <span className={`photo-preview ${className ?? ""}`} aria-hidden={alt ? undefined : true}>
      <span className="photo-preview__transform" style={outerStyle}>
        <span className="photo-preview__pan" style={innerStyle}>
          <img src={url} alt={alt} draggable={false} style={{ filter }} />
        </span>
      </span>
    </span>
  );
}
