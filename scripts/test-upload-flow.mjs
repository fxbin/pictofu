import assert from "node:assert/strict";
import fs from "node:fs";

const booth = fs.readFileSync("app/booth/booth-client.tsx", "utf8");
const analyticsSafety = fs.readFileSync("lib/analytics-safety.ts", "utf8");
const compositor = fs.readFileSync("lib/compositor-v3.ts", "utf8");

assert.match(booth, /source:\s*"camera"\s*\|\s*"upload"/, "CaptureSlot must keep camera/upload source truth");
assert.match(booth, /type="file"[^>]*accept="image\/\*"/, "Booth must expose an image-only local file picker");
assert.match(booth, /source:\s*"upload"/, "Uploaded files must become upload CaptureSlots");
assert.match(booth, /URL\.createObjectURL\(file\)/, "Uploaded photos must stay browser-local through object URLs");
assert.doesNotMatch(booth, /new\s+FormData\s*\(/, "Upload flow must not introduce multipart server uploads");
assert.doesNotMatch(booth, /\/api\/upload|uploadthing|cloudinary/i, "Upload flow must not introduce a media upload endpoint/provider");

assert.match(booth, /capture_source:\s*"camera"/, "Camera completion must preserve bounded capture-source analytics");
assert.match(booth, /capture_source:\s*"upload"/, "Upload completion must preserve bounded capture-source analytics");
assert.match(analyticsSafety, /"capture_source"/, "capture_source must be explicitly analytics-safe");

assert.match(booth, /updateActiveAdjustment/, "Uploaded photos must enter the shared Review adjustment controls");
assert.match(booth, /Drag to reposition/, "Review must retain drag-to-reframe UX");
assert.match(booth, /photoAdjustments:\s*readySlots\.map\(\(slot\)\s*=>\s*slot\.adjustment\)/, "Export must pass per-photo adjustment state into the compositor");
assert.match(compositor, /resolvePhotoTransform/, "Compositor must keep bounded transform resolution");
assert.match(compositor, /zoom:[\s\S]*?2\.5|2\.5[\s\S]*?zoom/, "Compositor must keep bounded zoom semantics");

assert.match(booth, /Replace photo/, "Uploaded photos must support single-photo replacement without restarting the whole set");
assert.match(booth, /start_booth[^\n]*booth_upload|cta_location:\s*"booth_upload"/, "Upload entry must be measurable as a distinct booth CTA");

console.log("Upload + PhotoAdjustment contract checks passed.");
