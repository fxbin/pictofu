import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(new URL("..", import.meta.url).pathname);

async function loadPureTypeScript(relativePath) {
  const sourcePath = path.join(root, relativePath);
  const source = await readFile(sourcePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
  });
  const outputPath = path.join(tmpdir(), `pictofu-${path.basename(relativePath, ".ts")}-${process.pid}-${Date.now()}.mjs`);
  await writeFile(outputPath, compiled.outputText, "utf8");
  return import(`${pathToFileURL(outputPath).href}?v=${Date.now()}`);
}

function assertSourceContract(source, description, pattern) {
  assert.match(source, pattern, description);
}

const boothState = await loadPureTypeScript("lib/booth-state.ts");
const analyticsSafety = await loadPureTypeScript("lib/analytics-safety.ts");
const boothSource = await readFile(path.join(root, "app/booth/booth-client.tsx"), "utf8");

// Selection/order model: fallback keeps capture order while skipping empty slots.
const captures = [
  { id: "a", crop: { x: 0.2, y: 0, zoom: 1.1 } },
  null,
  { id: "c", crop: { x: 0, y: 0.1, zoom: 1.2 } },
  { id: "d", crop: { x: -0.1, y: 0, zoom: 1 } },
];
assert.deepEqual(boothState.deriveSelectedPhotoIndexes(captures, undefined, 3), [0, 2, 3]);
assert.deepEqual(boothState.deriveSelectedPhotoIndexes(captures, [3, 0, 2], 3), [3, 0, 2]);
assert.deepEqual(boothState.deriveSelectedPhotoIndexes(captures, [3, 1, 99, 0], 3), [3, 0]);
assert.deepEqual(boothState.normalizePhotoSelection(captures, [2, 2, 0], 3), [2, 0]);
assert.equal(boothState.normalizePhotoSelection(captures, [0, 2, 3], 2), null);
assert.equal(boothState.normalizePhotoSelection(captures, [1], 3), null);

// Retake model: only one slot changes; untouched image/crop objects stay identical.
const replacement = { id: "replacement" };
const replaced = boothState.replaceCaptureSlot(captures, 2, replacement);
assert.notEqual(replaced, captures);
assert.equal(replaced[0], captures[0]);
assert.equal(replaced[1], captures[1]);
assert.equal(replaced[2], replacement);
assert.equal(replaced[3], captures[3]);
assert.equal(captures[2]?.id, "c");
assert.equal("crop" in replacement, false, "a replacement capture must not inherit the previous crop implicitly");

// Tie the executable model to the current Booth implementation so source drift fails CI.
assertSourceContract(
  boothSource,
  "export order must be derived from selected photo indexes",
  /const exportSlots = selectedPhotoIndexes\.map\(\(index\) => captureSlots\[index\] \?\? null\);/,
);
assertSourceContract(
  boothSource,
  "stored selection must preserve requested order while dropping unavailable slots",
  /storedPhotoSelection\.filter\(\(index\) => Boolean\(captureSlots\[index\]\)\)\.slice\(0, selectedLayoutTarget\)/,
);
assertSourceContract(
  boothSource,
  "single-slot retake must clone the slot array and replace only the target index",
  /setCaptureSlots\(\(current\) => \{\s*const next = \[\.\.\.current\];\s*next\[slotIndex\] = replacement;\s*return next;\s*\}\);/s,
);
assertSourceContract(
  boothSource,
  "template switching must preserve captured slots",
  /function selectPreset\([\s\S]*?setPresetId\(next\.id\);[\s\S]*?if \(capturedCount > 0\)/,
);
const selectPresetBody = boothSource.match(/function selectPreset\([\s\S]*?\n  }\n\n  function handleTemplateCarouselScroll/)?.[0] ?? "";
assert.ok(selectPresetBody.length > 0, "selectPreset implementation must be discoverable");
assert.doesNotMatch(selectPresetBody, /clearCaptureSlots\(/, "template switching must not destroy captured photos/crops");

// Analytics privacy: only allowlisted scalar metadata survives; media-like fields are dropped.
const longCampaign = "x".repeat(150);
const sanitized = analyticsSafety.sanitizeSafeEventProperties({
  preset_id: "classic-booth",
  layout_id: "strip-4",
  utm_campaign: longCampaign,
  photo: "raw-photo-data",
  blob_url: "blob:https://pictofu.com/secret",
  base64: "data:image/png;base64,secret",
  camera_frame: "secret-frame",
  exported_png: "secret-png",
});
assert.deepEqual(Object.keys(sanitized).sort(), ["layout_id", "preset_id", "utm_campaign"]);
assert.equal(sanitized.utm_campaign.length, 120);
assert.equal("photo" in sanitized, false);
assert.equal("blob_url" in sanitized, false);
assert.equal("base64" in sanitized, false);
assert.equal("camera_frame" in sanitized, false);
assert.equal("exported_png" in sanitized, false);

console.log("P0 contracts passed: Booth state/order/retake invariants and analytics media-data deny-by-default.");
