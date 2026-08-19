import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("app/booth/page.tsx", "utf8");
const dock = readFileSync("app/booth/mobile-style-dock.tsx", "utf8");
const css = readFileSync("app/booth/mobile-style-dock.css", "utf8");
const layoutFix = readFileSync("app/booth/mobile-layout-sheet-fix.css", "utf8");

assert.match(page, /import \{ MobileStyleDock \} from "\.\/mobile-style-dock";/);
assert.match(page, /import "\.\/mobile-style-dock\.css";/);
assert.match(page, /import "\.\/mobile-layout-sheet-fix\.css";/);
assert.ok(
  page.indexOf('import "./mobile-layout-sheet-fix.css";') > page.indexOf('import "./mobile-style-dock.css";'),
  "Layout visibility override must load after the base mobile Style dock CSS",
);
assert.match(page, /<MobileStyleDock \/>/);

for (const tool of ["template", "filter", "frame", "layout", "photos"]) {
  assert.match(dock, new RegExp(`chooseTool\\("${tool}"\\)`));
}

assert.match(dock, /type StyleTool = "template" \| "filter" \| "frame" \| "layout" \| "photos" \| null/);
assert.match(dock, /\.style-disclosure \.template-carousel__card/);
assert.match(dock, /\.style-disclosure \.filter-style-picker__item/);
assert.match(dock, /\.style-disclosure \.frame-choice/);
assert.match(dock, /\.booth-page--style \.style-disclosure--more/);
assert.match(dock, /details\.dataset\.mobileStyleTool = tool/);
assert.match(dock, /details\.open = true/);
assert.match(dock, /delete details\.dataset\.mobileStyleTool/);
assert.match(dock, /button\.click\(\)/);
assert.doesNotMatch(dock, /setPresetId|setFilterId|setFrameId|setLayoutId|setPhotoSelections|composePhotoStrip/);

assert.match(css, /@media \(max-width: 720px\)/);
assert.match(css, /\.mobile-style-dock\s*\{[\s\S]*position: fixed/);
assert.match(css, /\.mobile-style-dock__panel\s*\{[\s\S]*position: absolute[\s\S]*bottom: calc\(100% \+ 8px\)/);
assert.match(css, /\.mobile-style-dock__panel\s*\{[\s\S]*width: min\(calc\(100vw - 16px\), 720px\)/);
assert.match(css, /\.mobile-style-dock__panel\s*\{[\s\S]*max-height: min\(42dvh, 280px\)/);
assert.match(css, /\.mobile-style-dock__panel\s*\{[\s\S]*overflow-y: auto/);
assert.match(css, /\.mobile-style-dock__rail\s*\{[\s\S]*max-width: 100%[\s\S]*overflow-x: auto/);

assert.match(css, /\.booth-page--style \.style-disclosure\s*\{[\s\S]*display: none/);
assert.match(css, /\.style-disclosure--more\[data-mobile-style-tool\][\s\S]*position: fixed/);
assert.match(css, /data-mobile-style-tool="layout"[\s\S]*\.editor-control-group/);
assert.match(css, /data-mobile-style-tool="photos"[\s\S]*\[aria-label="Choose and arrange photos for this layout"\]/);
assert.match(css, /data-mobile-style-tool="photos"[\s\S]*\.style-disclosure__review-link/);
assert.match(css, /\.mobile-style-dock__tools\s*\{[\s\S]*grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);

assert.match(layoutFix, /@media \(max-width: 720px\)/);
assert.match(
  layoutFix,
  /data-mobile-style-tool="layout"\][\s\S]*max-height: min\([\s\S]*320px,[\s\S]*calc\(100dvh - 104px - env\(safe-area-inset-top\) - env\(safe-area-inset-bottom\)\)/,
  "Layout sheet height must be viewport-aware rather than capped by the old 34dvh / 230px rule",
);
assert.match(
  layoutFix,
  /data-mobile-style-tool="layout"\][\s\S]*> \.style-disclosure__content[\s\S]*overflow-y: auto/,
  "Layout sheet must fall back to internal vertical scrolling on short viewports",
);
assert.match(
  layoutFix,
  /data-mobile-style-tool="layout"\][\s\S]*\.choice-grid\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  "All four mobile Layout choices must use a complete 2x2 grid instead of hidden horizontal overflow",
);
assert.match(layoutFix, /\.choice-grid button\s*\{[\s\S]*min-width: 0[\s\S]*min-height: 64px/);
assert.doesNotMatch(layoutFix, /repeat\(4, minmax\(70px, 1fr\)\)/);

console.log("Mobile Style dock, complete Layout sheet and viewport contract checks passed.");
