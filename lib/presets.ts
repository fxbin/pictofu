export type BoothPreset = {
  id: string;
  name: string;
  description: string;
  layoutId: "strip-4" | "strip-3" | "grid-4" | "polaroid";
  filterId: "original" | "bw" | "warm" | "vintage" | "y2k";
  frameId: "cream" | "pink" | "lilac" | "mint";
  shotCount: number;
  accent: string;
};

export const PRESETS: BoothPreset[] = [
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
    id: "y2k-summer",
    name: "Y2K Summer",
    description: "Retro flash energy for sunny memories.",
    layoutId: "strip-4",
    filterId: "y2k",
    frameId: "lilac",
    shotCount: 4,
    accent: "blue",
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

export const DEFAULT_PRESET = PRESETS[0];

export function getPreset(id?: string | null): BoothPreset {
  return PRESETS.find((preset) => preset.id === id) ?? DEFAULT_PRESET;
}
