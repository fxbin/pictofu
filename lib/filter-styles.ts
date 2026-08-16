export const FILTER_STYLES = [
  {
    id: "original",
    label: "Original",
    description: "Neutral color with no added effect.",
    cssFilter: "none",
    swatch: "linear-gradient(145deg, #d7b4ab, #f6ded4)",
  },
  {
    id: "bw",
    label: "Mono",
    description: "Crisp monochrome with a little extra contrast.",
    cssFilter: "grayscale(1) contrast(1.06)",
    swatch: "linear-gradient(145deg, #777, #ddd)",
  },
  {
    id: "soft-cream",
    label: "Soft Cream",
    description: "Brighter, softer contrast with restrained saturation.",
    cssFilter: "brightness(1.07) contrast(.93) saturate(.94)",
    swatch: "linear-gradient(145deg, #efd8ca, #fff2e8)",
  },
  {
    id: "airy-day",
    label: "Airy Day",
    description: "Light, clear color with a slightly cooler feel.",
    cssFilter: "brightness(1.08) contrast(.95) saturate(.91) hue-rotate(3deg)",
    swatch: "linear-gradient(145deg, #d6e8ed, #f9eee5)",
  },
  {
    id: "warm",
    label: "Rose Glow",
    description: "A gentle warm-pink mood designed to stay skin-friendly.",
    cssFilter: "sepia(.12) saturate(1.12) brightness(1.04) hue-rotate(-4deg)",
    swatch: "linear-gradient(145deg, #cf8b76, #f5c8b1)",
  },
  {
    id: "golden-hour",
    label: "Golden Hour",
    description: "Soft amber warmth without heavy orange tones.",
    cssFilter: "sepia(.23) saturate(1.12) brightness(1.02) contrast(.98)",
    swatch: "linear-gradient(145deg, #bd875d, #f4d09a)",
  },
  {
    id: "vintage",
    label: "Film Fade",
    description: "A restrained faded-film mood with warm nostalgia.",
    cssFilter: "sepia(.34) contrast(.90) saturate(.88) brightness(1.01)",
    swatch: "linear-gradient(145deg, #827467, #c4aa91)",
  },
  {
    id: "ccd-flash",
    label: "CCD Flash",
    description: "Punchier contrast and brighter highlights for a digicam feel.",
    cssFilter: "contrast(1.13) saturate(1.12) brightness(1.04)",
    swatch: "linear-gradient(145deg, #aab9d8, #f7d7de)",
  },
  {
    id: "y2k",
    label: "Y2K Pop",
    description: "Saturated playful color with magenta-blue energy.",
    cssFilter: "saturate(1.34) contrast(1.08) hue-rotate(-14deg)",
    swatch: "linear-gradient(145deg, #a7bbed, #e5acd5)",
  },
  {
    id: "cool-mint",
    label: "Cool Mint",
    description: "A restrained cool cyan-green cast.",
    cssFilter: "saturate(.92) contrast(.98) brightness(1.02) hue-rotate(11deg)",
    swatch: "linear-gradient(145deg, #a7d4cb, #dbe9e4)",
  },
  {
    id: "peach-candy",
    label: "Peach Candy",
    description: "Bright peach-pink color for a soft social mood.",
    cssFilter: "saturate(1.18) brightness(1.06) contrast(.96) hue-rotate(-7deg)",
    swatch: "linear-gradient(145deg, #f0ae9f, #f7d0c8)",
  },
] as const;

export type FilterStyle = (typeof FILTER_STYLES)[number];
export type FilterId = FilterStyle["id"];

const FILTER_STYLE_BY_ID = Object.fromEntries(
  FILTER_STYLES.map((style) => [style.id, style]),
) as Record<FilterId, FilterStyle>;

export function getFilterStyle(filterId: FilterId): FilterStyle {
  return FILTER_STYLE_BY_ID[filterId];
}

export function filterCssValue(filterId: FilterId): string {
  return getFilterStyle(filterId).cssFilter;
}
