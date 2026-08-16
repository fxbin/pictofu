import type { CSSProperties } from "react";
import Image from "next/image";
import { getReadyPresetDemoAsset } from "@/lib/demo-assets";

type PresetDemoMediaProps = {
  presetId: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  fit?: "contain" | "cover";
  style?: CSSProperties;
};

const TREATMENT_STYLES = {
  "warm-faded-film": {
    filter: "sepia(0.28) saturate(0.82) contrast(0.94) brightness(0.98)",
  },
} satisfies Record<string, CSSProperties>;

/**
 * Fail-closed renderer for static preset marketing media.
 * Pending assets render nothing, so a missing binary can never become a public
 * broken image merely because its intended path exists in the manifest.
 */
export function PresetDemoMedia({
  presetId,
  className,
  sizes,
  priority = false,
  fit = "contain",
  style,
}: PresetDemoMediaProps) {
  const asset = getReadyPresetDemoAsset(presetId);
  if (!asset) return null;

  const imageStyle: CSSProperties = fit === "cover"
    ? { width: "100%", height: "100%", objectFit: "cover", display: "block" }
    : { width: "100%", height: "auto", objectFit: "contain", display: "block" };

  const treatmentStyle = asset.treatment
    ? TREATMENT_STYLES[asset.treatment]
    : undefined;

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ ...imageStyle, ...treatmentStyle, ...style }}
    />
  );
}
