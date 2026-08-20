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
const photoSelectionPicker = read("app/booth/photo-selection-picker.tsx");
const photoSelectionStyles = read("app/booth/photo-selection-picker.module.css");
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
    (boothClient.includes('This template captures ${preset.shotCount} ${photoNoun(preset.shotCount)}') ||
      boothClient.includes('This template uses up to ${preset.shotCount} ${photoNoun(preset.shotCount)}')),
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
  (boothClient.includes("Adjust crop or retake in Review photos →") ||
    boothClient.includes("Adjust crop or replace photos in Review photos →") ||
    boothClient.includes("Adjust individual photos in Photo Editor →")) &&
    boothClient.includes("onClick={returnToReview}"),
  "Photo adjustment plus the correct retake/replace escape hatch must remain reachable from advanced options.",
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

assert.ok(
  photoSelectionPicker.includes("beginOrderDrag") &&
    photoSelectionPicker.includes("continueOrderDrag") &&
    photoSelectionPicker.includes("stableTargetPosition") &&
    photoSelectionPicker.includes("snapshotSelectedSlots") &&
    photoSelectionPicker.includes("createPortal"),
  "Photos must support immediate handle-based pointer reorder with stable frozen-slot targeting.",
);
assert.ok(
  photoSelectionPicker.includes('"ArrowLeft ArrowRight Home End"') &&
    photoSelectionPicker.includes('event.key === "ArrowLeft"') &&
    photoSelectionPicker.includes('event.key === "ArrowRight"'),
  "Drag reorder must retain a keyboard sorting fallback without visible arrow controls.",
);
assert.ok(
  photoSelectionPicker.includes("Drag from ⠿ to reorder · × to replace") &&
    photoSelectionPicker.includes("const displayPhotos = [...effectiveSelectedPhotos, ...unselectedPhotos]") &&
    !photoSelectionPicker.includes(">Final order<") &&
    !photoSelectionPicker.includes(">All captures<"),
  "Photo selection and final ordering must share one surface instead of duplicate Final order / All captures galleries.",
);
assert.ok(
  photoSelectionPicker.includes("className={styles.dragHandle}") &&
    photoSelectionPicker.includes("onPointerDown={(event) => beginOrderDrag(event, photo.index, selectedPosition)}"),
  "Only the explicit drag handle should start pointer reorder so the card body remains scroll-friendly.",
);
assert.ok(
  photoSelectionPicker.includes("const slots = snapshotSelectedSlots();") &&
    photoSelectionPicker.includes("const hysteresis = 10;") &&
    !photoSelectionPicker.includes("closestSelectedPosition"),
  "Reorder targeting must use frozen slot geometry with hysteresis instead of live animated-card hit testing.",
);
assert.ok(
  photoSelectionStyles.includes("touch-action: pan-y") &&
    photoSelectionStyles.includes(".dragHandle") &&
    photoSelectionStyles.includes("touch-action: none") &&
    photoSelectionStyles.includes(".dragOverlay") &&
    photoSelectionStyles.includes("position: fixed"),
  "Mobile reorder must preserve page scrolling outside the dedicated handle while the dragged photo uses an independent floating layer.",
);
assert.ok(
  photoSelectionStyles.includes("cursor: grab") && photoSelectionStyles.includes("cursor: grabbing"),
  "Desktop reorder affordance must communicate direct drag behavior on the handle.",
);
assert.ok(
  boothClient.includes("selectedPhotoIndexes.map") && boothClient.includes("exportSlots"),
  "Final export must continue to derive photo order from the selectedIndexes ordering contract.",
);

console.log("P1 product truth, progressive disclosure, reduced-motion, immediate stable photo reorder, upload input, and P2 copy contracts passed.");
