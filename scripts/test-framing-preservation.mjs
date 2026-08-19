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
assert.match(compositor, /photoRatios\[index\] === "auto" \? "contain" : "cover"/, "Auto export framing must preserve the full photo while explicit ratios crop");

assert.match(preview, /const fitMode = framing === "auto" \? "contain" : "cover"/, "Editor preview must use contain for the default framing state");
assert.match(preview, /resolvePhotoTransform\([\s\S]*?fitMode,\s*\)/, "Editor preview must pass the same fit mode into shared geometry");
assert.match(preview, /data-photo-fit=\{fitMode\}/, "Preview DOM must expose the resolved fit mode for verification/debugging");

assert.match(controller, /id: "auto", label: "Fit", detail: "Full photo"/, "Default framing control must describe full-photo behavior truthfully");
assert.match(controller, /Only this photo changes/, "Per-photo scope copy must remain explicit");
assert.match(cameraFix, /object-fit:\s*contain/, "Live camera preview must not hide source-frame edges");
assert.match(page, /camera-framing-fix\.css/, "Booth page must load the camera framing override after the base camera styles");

console.log("Camera-to-editor framing preservation contract checks passed.");
