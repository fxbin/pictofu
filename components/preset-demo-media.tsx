import Image from "next/image";
import { getReadyPresetDemoAsset } from "@/lib/demo-assets";

type PresetDemoMediaProps = {
  presetId: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  fit?: "contain" | "cover";
};

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
}: PresetDemoMediaProps) {
  const asset = getReadyPresetDemoAsset(presetId);
  if (!asset) return null;

  const imageStyle = fit === "cover"
    ? { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" }
    : { width: "100%", height: "auto", objectFit: "contain" as const, display: "block" };

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={imageStyle}
    />
  );
}
