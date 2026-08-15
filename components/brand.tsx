import Link from "next/link";

export function TofuMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand--compact" : ""}`} aria-label="PicTofu">
      <span className="tofu-mark" aria-hidden="true">
        <span className="tofu-mark__eyes">•‿•</span>
      </span>
      <span className="brand__word">PicTofu</span>
    </span>
  );
}

export function BrandLink() {
  return (
    <Link className="brand-link" href="/" aria-label="PicTofu home">
      <TofuMark />
    </Link>
  );
}
