export type PhotoStripLayout = "4-strip" | "6-strip" | "2x2";

export type PhotoStripTheme = {
  id: string;
  name: string;
  category: string;
  layout: PhotoStripLayout;
  frameStyle: string;
};

export const photoStripThemes: PhotoStripTheme[] = [
  {
    id: "classic-booth",
    name: "Classic Booth",
    category: "classic",
    layout: "4-strip",
    frameStyle: "classic-black",
  },
  {
    id: "korean-4cut",
    name: "Korean 4Cut",
    category: "social",
    layout: "4-strip",
    frameStyle: "clean-white",
  },
  {
    id: "film-camera",
    name: "Film Camera",
    category: "vintage",
    layout: "4-strip",
    frameStyle: "film-border",
  },
  {
    id: "couple-date",
    name: "Couple Date",
    category: "memory",
    layout: "4-strip",
    frameStyle: "soft-paper",
  },
];
