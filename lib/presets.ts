import type { FilterId } from "@/lib/filter-styles";
import type { FrameId } from "@/lib/frame-styles";

export type BoothPreset = {
  id: string;
  name: string;
  description: string;
  layoutId: "strip-4" | "strip-3" | "grid-4" | "polaroid";
  filterId: FilterId;
  frameId: FrameId;
  shotCount: number;
  accent: string;
};

export const PRESETS: BoothPreset[] = [
  {
    id: "classic-booth",
    name: "Classic Booth",
    description: "A clean four-cut strip that works for any moment.",
    layoutId: "strip-4",
    filterId: "original",
    frameId: "white",
    shotCount: 4,
    accent: "cream",
  },
  {
    id: "korean-date",
    name: "Korean Date",
    description: "Soft, romantic, and perfect for two.",
    layoutId: "strip-4",
    filterId: "warm",
    frameId: "pink",
    shotCount: 4,
    accent: "pink",
  },
  {
    id: "couple-date",
    name: "Couple Date",
    description: "A blush four-cut strip for dates and anniversaries.",
    layoutId: "strip-4",
    filterId: "original",
    frameId: "pink",
    shotCount: 4,
    accent: "pink",
  },
  {
    id: "y2k-summer",
    name: "Y2K Summer",
    description: "Retro flash energy for sunny memories.",
    layoutId: "strip-4",
    filterId: "y2k",
    frameId: "chrome",
    shotCount: 4,
    accent: "blue",
  },
  {
    id: "vintage-film",
    name: "Vintage Film",
    description: "Warm, faded film tones for a nostalgic photo strip.",
    layoutId: "strip-4",
    filterId: "vintage",
    frameId: "film",
    shotCount: 4,
    accent: "cream",
  },
  {
    id: "polaroid-moment",
    name: "Polaroid Moment",
    description: "One photo in a roomy instant-film-style frame.",
    layoutId: "polaroid",
    filterId: "original",
    frameId: "cream",
    shotCount: 1,
    accent: "cream",
  },
  {
    id: "best-friends",
    name: "Best Friends",
    description: "Capture all the laughs with your besties.",
    layoutId: "grid-4",
    filterId: "original",
    frameId: "lilac",
    shotCount: 4,
    accent: "lilac",
  },
  {
    id: "graduation",
    name: "Graduation",
    description: "A tiny strip for a very big moment.",
    layoutId: "strip-3",
    filterId: "warm",
    frameId: "mint",
    shotCount: 3,
    accent: "mint",
  },
];

export const FEATURED_PRESET_IDS = ["korean-date", "y2k-summer", "best-friends", "graduation"] as const;

export const FEATURED_PRESETS = FEATURED_PRESET_IDS.map((id) => {
  const preset = PRESETS.find((item) => item.id === id);
  if (!preset) throw new Error(`Featured preset ${id} is missing`);
  return preset;
});

export const DEFAULT_PRESET = PRESETS[0];

export function getPreset(id?: string | null): BoothPreset {
  return PRESETS.find((preset) => preset.id === id) ?? DEFAULT_PRESET;
}
