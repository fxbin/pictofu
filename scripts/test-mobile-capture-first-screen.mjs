import assert from "node:assert/strict";
import fs from "node:fs";

const viewport = fs.readFileSync("app/booth/mobile-viewport.css", "utf8");
const booth = fs.readFileSync("app/booth/booth-client.tsx", "utf8");
const privacy = fs.readFileSync("components/analytics-consent-gate.module.css", "utf8");

assert.match(viewport, /calc\(100dvh - 325px - env\(safe-area-inset-top\) - env\(safe-area-inset-bottom\)\)/, "Mobile capture preview must budget against the dynamic viewport and safe areas");
assert.match(viewport, /height:\s*clamp\(\s*230px,[\s\S]*?500px\s*\)/, "Normal mobile capture must let preview height yield before pushing start actions below the fold");
assert.match(viewport, /max-height:\s*620px[\s\S]*?height:\s*clamp\(\s*205px/, "Short portrait phones must have a dedicated smaller preview fallback");

assert.match(viewport, /\.capture-status > div:last-child\s*\{[\s\S]*?display:\s*grid !important[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/, "Enable camera and Upload photos must stay side-by-side on mobile");
assert.match(booth, />\s*Upload photos\s*</, "Upload photos must remain an explicit capture entry action");
assert.match(booth, /return "Enable camera"/, "Camera permission entry must remain explicit");

assert.match(viewport, /\.capture-tray > button:first-child,\s*\.capture-tray > button:last-child\s*\{\s*display:\s*none/, "Mobile tray must not spend first-screen slots on Edit-after and unavailable Flash controls");
assert.match(viewport, /\.capture-tray > button:nth-child\(2\)\s*\{[\s\S]*?pointer-events:\s*none/, "The fixed 3-second timer must behave as passive status on mobile");
assert.match(viewport, /:has\(\.live-dot\.is-live\)[\s\S]*?button:first-child\s*\{\s*display:\s*none/, "Once camera is live, the shutter must remain the primary capture action instead of duplicating Take photos below it");

assert.match(privacy, /:global\(body:has\(\.booth-page\)\) \.settingsButton\s*\{[\s\S]*?position:\s*absolute/, "Collapsed Privacy settings must scroll away inside Booth instead of following the editing canvas");
assert.match(privacy, /\.settingsButton\s*\{[\s\S]*?position:\s*fixed/, "Non-Booth privacy settings must remain persistently reachable");
assert.match(privacy, /:global\(body:has\(\.booth-page\)\) \.banner\s*\{/, "Opening privacy settings in Booth must still use the full settings panel");

console.log("Mobile capture first-screen and non-obstructive Booth privacy contracts passed.");
