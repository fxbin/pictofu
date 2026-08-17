import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const home = read("app/page.tsx");
const homePreview = read("components/home-booth-preview.tsx");
const layouts = read("app/layouts/page.tsx");
const seoExperience = read("components/seo-experience-page.tsx");
const about = read("app/about/page.tsx");
const boothPage = read("app/booth/page.tsx");
const privacy = read("app/privacy/page.tsx");
const footer = read("components/site-footer.tsx");
const seoPages = read("lib/seo-pages.ts");
const filterStyles = read("lib/filter-styles.ts");

assert.ok(
  home.includes('href="/booth?preset=classic-booth"'),
  "Homepage Start Booth must enter the known-good Classic Booth preset directly.",
);
assert.ok(
  home.includes('className="secondary-button" href="/layouts"'),
  "Homepage must preserve /layouts as the explicit browse/compare path.",
);

assert.ok(
  homePreview.includes('import { getFilterStyle } from "@/lib/filter-styles"'),
  "Homepage preview must consume the canonical filter registry.",
);
assert.ok(
  homePreview.includes("HOME_FILTER_IDS") && homePreview.includes("getFilterStyle(filterId)"),
  "Homepage preview filters must be resolved from canonical filter ids.",
);
assert.ok(
  !homePreview.includes("treatment:"),
  "Homepage preview must not maintain a second CSS filter recipe system.",
);

assert.ok(
  layouts.includes('import { getFilterStyle } from "@/lib/filter-styles"') && layouts.includes("{filter.label}"),
  "Layouts cards must show canonical friendly filter labels.",
);
assert.ok(
  seoExperience.includes('import { getFilterStyle } from "@/lib/filter-styles"') && seoExperience.includes("{filter.label}"),
  "SEO experience cards must show canonical friendly filter labels.",
);
assert.ok(
  !layouts.includes("<span>{preset.filterId}</span>") && !seoExperience.includes("<span>{preset.filterId}</span>"),
  "Public cards must not expose raw filter ids as user-facing labels.",
);

assert.ok(
  about.includes('import { FILTER_STYLES } from "@/lib/filter-styles"') &&
    about.includes('import { FRAME_STYLES } from "@/lib/frame-styles"'),
  "About capabilities must derive filter/frame truth from the canonical registries.",
);

for (const [id, label] of [
  ["original", "Original"],
  ["bw", "Mono"],
  ["warm", "Rose Glow"],
  ["vintage", "Film Fade"],
  ["y2k", "Y2K Pop"],
]) {
  assert.ok(
    filterStyles.includes(`id: "${id}"`) && filterStyles.includes(`label: "${label}"`),
    `Canonical filter registry must retain ${id} → ${label}.`,
  );
}

const publicCopyFiles = {
  "app/page.tsx": home,
  "app/about/page.tsx": about,
  "app/booth/page.tsx": boothPage,
  "app/privacy/page.tsx": privacy,
  "components/site-footer.tsx": footer,
  "components/seo-experience-page.tsx": seoExperience,
  "lib/seo-pages.ts": seoPages,
};

for (const [file, source] of Object.entries(publicCopyFiles)) {
  assert.ok(!/\bMVP\b/i.test(source), `${file} must not present PicToFu to users as an unfinished MVP.`);
}

console.log("P1 product truth contracts passed.");
