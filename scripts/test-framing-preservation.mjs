import assert from "node:assert/strict";
import fs from "node:fs";

const compositor = fs.readFileSync("lib/compositor-v3.ts", "utf8");
const preview = fs.readFileSync("app/booth/photo-preview.tsx", "utf8");
const controller = fs.readFileSync("app/booth/photo-framing-controller.tsx", "utf8");
const cameraFix = fs.readFileSync("app/booth/camera-framing-fix.css", "utf8");
const page = fs.readFileSync("app/booth/page.tsx", "utf8");

assert.match(compositor, /PhotoFitMode\s*=\s*"cover"\s*\|\s*"contain"/, "Shared compositor must model cover and contain explicitly");
assert.match(compositor, /containScale/, "Shared transform geometry must calculate contain scaling");
assert.match(compositor, /fitMode === "contain" \? containScale : coverScale/, "Default-fit and explicit-crop modes must share one transform resolver");
assert.match(compositor, /sourceAspectRatioForRotation/, "Auto framing must resolve the source photo's displayed orientation");
assert.match(compositor, /resolvePhotoAspectRatio/, "Preview and export must share one aspect-ratio resolver");
assert.match(compositor, /const resolvedPhotoRatios = images\.map/, "Export geometry must resolve numeric ratios from the actual source images");
assert.match(compositor, /layoutGeometry\(input\.layoutId, images\.length, resolvedPhotoRatios\)/, "Final strip geometry must consume source-owned ratios instead of template Auto geometry");
assert.match(compositor, /photoFramings\[index\] === "auto" \? "contain" : "cover"/, "Auto export framing must preserve the full photo while explicit ratios crop");

assert.match(preview, /resolvePhotoAspectRatio/, "Editor preview must resolve the same source-owned ratio as export");
assert.match(preview, /\.review-stage__photo, \.result-strip__photo/, "Only true editor/result frame hosts may inherit source-owned geometry");
assert.match(preview, /host\.style\.aspectRatio = String\(sourceOwnedRatio\)/, "Auto frame host must adopt the actual photo ratio rather than keep the template ratio");
assert.match(preview, /const effectiveRatio = customRatio \?\? \(ownsFrameGeometry \? sourceOwnedRatio : targetRatio\)/, "Thumbnails may keep host geometry while editor/result Auto follows the source");
assert.match(preview, /const fitMode = framing === "auto" \? "contain" : "cover"/, "Editor preview must use contain for the default framing state");
assert.match(preview, /resolvePhotoTransform\([\s\S]*?fitMode,\s*\)/, "Editor preview must pass the same fit mode into shared geometry");
assert.match(preview, /data-photo-fit=\{fitMode\}/, "Preview DOM must expose the resolved fit mode for verification/debugging");

assert.match(controller, /id: "auto", label: "Fit", detail: "Full photo"/, "Default framing control must describe full-photo behavior truthfully");
assert.match(controller, /Only this photo changes/, "Per-photo scope copy must remain explicit");
assert.match(cameraFix, /object-fit:\s*contain/, "Live camera preview must not hide source-frame edges");
assert.match(cameraFix, /content:\s*"Final frame"/, "Default Review framing must not claim that an implicit crop already happened");
assert.match(page, /camera-framing-fix\.css/, "Booth page must load the camera framing override");
assert.ok(
  page.indexOf('import "./camera-framing-fix.css";') > page.indexOf('import "./workspace-modes.css";'),
  "Framing truth overrides must load after legacy Review crop styles",
);

console.log("Camera-to-editor source geometry preservation contract checks passed.");
