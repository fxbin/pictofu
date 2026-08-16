export type FrameId =
  | "white"
  | "cream"
  | "pink"
  | "black"
  | "lilac"
  | "mint"
  | "chrome"
  | "film";

export type FrameCategory = "basic" | "cute" | "retro";

export type FrameStyle = {
  id: FrameId;
  label: string;
  category: FrameCategory;
  background: string;
  ink: string;
  cell: string;
};

export const FRAME_STYLES: readonly FrameStyle[] = [
  {
    id: "white",
    label: "Clean White",
    category: "basic",
    background: "#ffffff",
    ink: "#4d4947",
    cell: "#f8f7f5",
  },
  {
    id: "cream",
    label: "Soft Cream",
    category: "basic",
    background: "#fff1df",
    ink: "#654d47",
    cell: "#fffaf5",
  },
  {
    id: "black",
    label: "Black Film",
    category: "basic",
    background: "#171717",
    ink: "#f7f3ec",
    cell: "#282828",
  },
  {
    id: "pink",
    label: "Blush Hearts",
    category: "cute",
    background: "#ffdce6",
    ink: "#805564",
    cell: "#fff8fa",
  },
  {
    id: "lilac",
    label: "Lilac Stars",
    category: "cute",
    background: "#eadfff",
    ink: "#655278",
    cell: "#fbf8ff",
  },
  {
    id: "mint",
    label: "Mint Doodle",
    category: "cute",
    background: "#dff3ed",
    ink: "#466d64",
    cell: "#f8fffc",
  },
  {
    id: "chrome",
    label: "Chrome Y2K",
    category: "retro",
    background: "#d9d8e8",
    ink: "#514e6c",
    cell: "#fbfaff",
  },
  {
    id: "film",
    label: "Vintage Film",
    category: "retro",
    background: "#c8a47f",
    ink: "#4a3426",
    cell: "#f7ecdc",
  },
] as const;

export function getFrameStyle(id: FrameId): FrameStyle {
  return FRAME_STYLES.find((frame) => frame.id === id) ?? FRAME_STYLES[0];
}
