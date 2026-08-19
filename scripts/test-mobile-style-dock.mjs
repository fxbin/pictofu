import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("app/booth/page.tsx", "utf8");
const dock = readFileSync("app/booth/mobile-style-dock.tsx", "utf8");
const css = readFileSync("app/booth/mobile-style-dock.css", "utf8");

assert.match(page, /import \{ MobileStyleDock \} from "\.\/mobile-style-dock";/);
assert.match(page, /import "\.\/mobile-style-dock\.css";/);
assert.match(page, /<MobileStyleDock \/>/);

for (const tool of ["template", "filter", "frame"]) {
  assert.match(dock, new RegExp(`chooseTool\\("${tool}"\\)`));
}

assert.match(dock, /\.style-disclosure \.template-carousel__card/);
assert.match(dock, /\.style-disclosure \.filter-style-picker__item/);
assert.match(dock, /\.style-disclosure \.frame-choice/);
assert.match(dock, /button\.click\(\)/);
assert.doesNotMatch(dock, /setPresetId|setFilterId|setFrameId|composePhotoStrip/);

assert.match(css, /@media \(max-width: 720px\)/);
assert.match(css, /\.mobile-style-dock\s*\{[\s\S]*position: fixed/);
assert.match(css, /\.booth-page--style \.style-disclosure:not\(\.style-disclosure--more\)\s*\{[\s\S]*display: none/);
assert.doesNotMatch(css, /\.style-disclosure--more\s*\{[\s\S]*display:\s*none/);

console.log("Mobile Style dock contract checks passed.");
