import type { BoothPreset } from "@/lib/presets";

type LayoutId = BoothPreset["layoutId"];

export type LayoutDemoAsset = {
  layoutId: LayoutId;
  label: string;
  note: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  bytes: number;
};

export const LAYOUT_DEMO_ASSETS: readonly LayoutDemoAsset[] = [
  {
    layoutId: "strip-4",
    label: "1 × 4 strip",
    note: "Four stacked moments",
    src: "/demo/layouts/classic-strip-1x4.webp",
    width: 300,
    height: 857,
    alt: "Cream four-photo booth strip featuring a Black woman in four natural poses.",
    bytes: 11_788,
  },
  {
    layoutId: "strip-3",
    label: "1 × 3 strip",
    note: "A shorter keepsake",
    src: "/demo/layouts/friends-strip-1x3.webp",
    width: 300,
    height: 652,
    alt: "Mint three-photo booth strip featuring three friends posing together.",
    bytes: 19_146,
  },
  {
    layoutId: "grid-4",
    label: "2 × 2 grid",
    note: "Four equal frames",
    src: "/demo/layouts/best-friends-grid-2x2.webp",
    width: 300,
    height: 314,
    alt: "Lilac two-by-two photo booth grid featuring three friends making playful expressions.",
    bytes: 10_988,
  },
  {
    layoutId: "polaroid",
    label: "Polaroid",
    note: "One framed memory",
    src: "/demo/layouts/polaroid-moment.webp",
    width: 300,
    height: 346,
    alt: "Cream Polaroid-style photo featuring a woman holding flowers outdoors.",
    bytes: 8_066,
  },
] as const;

export const LAYOUT_DEMO_TOTAL_BYTES = LAYOUT_DEMO_ASSETS.reduce(
  (total, asset) => total + asset.bytes,
  0,
);
