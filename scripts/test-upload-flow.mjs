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

const captureCompletedEmissions = booth.match(/emitProductEvent\("capture_completed"/g) ?? [];
assert.equal(captureCompletedEmissions.length, 1, "capture_completed must have one centralized export-ready emission path");
assert.match(booth, /captureCompletedRef\s*=\s*useRef\(false\)/, "Capture completion must be guarded once per capture cycle");
assert.match(booth, /if\s*\(!exportReady\s*\|\|\s*captureCompletedRef\.current\)\s*return/, "Partial photo sets must not count as capture_completed before export readiness");
assert.match(booth, /captureCompletedRef\.current\s*=\s*true[\s\S]*?emitProductEvent\("capture_completed"/, "The export-ready transition must mark completion before emitting the funnel stage");
assert.match(booth, /captureCompletedRef\.current\s*=\s*false/, "Starting over or replacing the whole set must reset the capture completion guard");
assert.match(booth, /shot_count:\s*readySlots\.length/, "capture_completed shot_count must describe the export-ready set rather than any partial upload batch");
assert.doesNotMatch(booth, /shot_count:\s*prepared\.length[\s\S]{0,160}?capture_source:\s*"upload"/, "Partial upload batches must not directly emit capture_completed");

assert.match(booth, /updateActiveAdjustment/, "Uploaded photos must enter the shared Review adjustment controls");
assert.match(booth, /Drag to reposition/, "Review must retain drag-to-reframe UX");
assert.match(booth, /photoAdjustments:\s*readySlots\.map\(\(slot\)\s*=>\s*slot\.adjustment\)/, "Export must pass per-photo adjustment state into the compositor");
assert.match(compositor, /resolvePhotoTransform/, "Compositor must keep bounded transform resolution");
assert.match(compositor, /zoom:[\s\S]*?2\.5|2\.5[\s\S]*?zoom/, "Compositor must keep bounded zoom semantics");

assert.match(booth, /Replace photo/, "Uploaded photos must support single-photo replacement without restarting the whole set");
assert.match(booth, /start_booth[^\n]*booth_upload|cta_location:\s*"booth_upload"/, "Upload entry must be measurable as a distinct booth CTA");

console.log("Upload + PhotoAdjustment + export-ready capture completion contract checks passed.");
