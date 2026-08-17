import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const home = read("app/page.tsx");
const homePreview = read("components/home-booth-preview.tsx");
const homePreviewStyles = read("components/home-booth-preview.module.css");
const layouts = read("app/layouts/page.tsx");
const seoExperience = read("components/seo-experience-page.tsx");
const about = read("app/about/page.tsx");
const boothPage = read("app/booth/page.tsx");
const boothClient = read("app/booth/booth-client.tsx");
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
  homePreview.includes("useSyncExternalStore") &&
    homePreview.includes('const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"'),
  "Homepage preview must subscribe to the user's reduced-motion preference.",
);
assert.ok(
  homePreview.includes("if (!autoPlay || prefersReducedMotion) return;"),
  "Homepage preview autoplay must stop when reduced motion is requested.",
);
assert.ok(
  homePreview.includes("if (prefersReducedMotion)") && homePreview.includes("setActiveIndex(index)"),
  "Reduced-motion users must still be able to select filters manually without restarting autoplay.",
);
assert.ok(
  homePreviewStyles.includes("@media (prefers-reduced-motion: reduce)") &&
    homePreviewStyles.includes("transition: none"),
  "Homepage preview CSS transitions must remain disabled for reduced-motion users.",
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
assert.ok(
  about.includes("Capture the shots for this preset using the built-in countdown.") &&
    !about.includes("three- or four-shot session"),
  "About capture copy must cover one-, three-, and four-shot presets without hard-coded shot counts.",
);
assert.ok(
  boothClient.includes('function photoNoun(count: number)') &&
    boothClient.includes('count === 1 ? "photo" : "photos"') &&
    boothClient.includes('This template captures ${preset.shotCount} ${photoNoun(preset.shotCount)}'),
  "Booth layout tooltip must use singular photo for one-shot presets and plural photos otherwise.",
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

assert.ok(
  boothClient.includes('className="style-progressive"'),
  "Post-capture Style mode must expose the progressive export surface.",
);
assert.ok(
  boothClient.includes('<details className="style-disclosure">') &&
    boothClient.includes('<details className="style-disclosure style-disclosure--more">'),
  "Look customization and advanced layout/photo controls must be collapsed behind native disclosures.",
);
assert.ok(
  boothClient.includes("Share or download this strip") &&
    boothClient.includes("You can export the current result without changing anything else."),
  "The default post-capture state must make export feel complete without mandatory editing.",
);
assert.ok(
  boothClient.includes("Adjust crop or retake in Review photos →") &&
    boothClient.includes("onClick={returnToReview}"),
  "Crop and retake must remain reachable from the advanced escape hatch.",
);
assert.ok(
  boothClient.includes('!(workspaceMode === "style" && capturedCount > 0) && templateControls'),
  "Pre-capture template selection must remain visible; progressive disclosure only applies after capture.",
);

const progressiveStart = boothClient.indexOf('className="style-progressive"');
const progressiveSource = boothClient.slice(progressiveStart);
assert.ok(progressiveStart >= 0, "Progressive Style section must exist.");
assert.ok(
  progressiveSource.indexOf("{exportControls}") >= 0 &&
    progressiveSource.indexOf("{exportControls}") < progressiveSource.indexOf('className="style-disclosure"'),
  "Export actions must appear before optional customization in post-capture Style mode.",
);

for (const invariant of [
  "async function retakeSlot",
  "function choosePhotoSelection",
  "async function createStrip",
  "composePhotoStrip({",
  "async function shareStrip",
  "async function downloadStrip",
]) {
  assert.ok(boothClient.includes(invariant), `Existing Booth capability must remain present: ${invariant}`);
}

assert.ok(
  boothPage.includes('import "./progressive-disclosure.css"'),
  "Booth page must load the progressive disclosure stylesheet.",
);

console.log("P1 product truth, progressive disclosure, reduced-motion, and P2 copy contracts passed.");
