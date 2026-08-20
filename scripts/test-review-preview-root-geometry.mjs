import assert from "node:assert/strict";
import fs from "node:fs";

const legacyCamera = fs.readFileSync("app/booth/camera.css", "utf8");
const framingFix = fs.readFileSync("app/booth/camera-framing-fix.css", "utf8");
const page = fs.readFileSync("app/booth/page.tsx", "utf8");

assert.match(
  legacyCamera,
  /\.capture-review__active-photo\s*>\s*span\s*\{[\s\S]*?left:\s*50%[\s\S]*?transform:\s*translateX\(-50%\)/,
  "Regression fixture: the legacy hint-pill selector is broad enough to collide with PhotoPreview's direct span root",
);

assert.match(
  framingFix,
  /\.review-stage__photo\s*>\s*\.photo-preview\s*\{[\s\S]*?inset:\s*0[\s\S]*?left:\s*0[\s\S]*?right:\s*0[\s\S]*?padding:\s*0[\s\S]*?transform:\s*none/,
  "Review PhotoPreview root must explicitly fill the adaptive host instead of inheriting the legacy half-width hint geometry",
);

assert.ok(
  page.indexOf('import "./camera-framing-fix.css";') > page.indexOf('import "./camera.css";'),
  "Review preview-root geometry fix must load after the legacy camera stylesheet",
);

console.log("Review adaptive host and full-width PhotoPreview root geometry contract checks passed.");
