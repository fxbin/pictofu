import Image from "next/image";
import { getApprovedDemoAsset } from "@/lib/demo-assets";
import styles from "./demo-asset-media.module.css";

type DemoAssetMediaProps = {
  presetId: string;
  variant: "strip" | "card";
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Renders only visually-approved static marketing assets.
 * Planned/candidate assets intentionally render nothing so a bad or missing
 * image can never leak into production just because it exists in the registry.
 */
export function DemoAssetMedia({
  presetId,
  variant,
  className,
  priority = false,
  sizes,
}: DemoAssetMediaProps) {
  const asset = getApprovedDemoAsset(presetId);
  if (!asset) return null;

  const isStrip = variant === "strip";
  const mediaClassName = className ? `${styles.media} ${className}` : styles.media;

  return (
    <Image
      src={isStrip ? asset.stripSrc : asset.cardSrc}
      alt={asset.alt}
      width={isStrip ? 640 : 960}
      height={isStrip ? 1920 : 720}
      className={mediaClassName}
      priority={priority}
      sizes={sizes ?? (isStrip ? "(max-width: 760px) 30vw, 124px" : "(max-width: 760px) 88vw, 480px")}
    />
  );
}
