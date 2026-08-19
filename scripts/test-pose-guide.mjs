import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const registry = read("lib/pose-guides.ts");
const profile = read("lib/pose-guide-measurement.ts");
const controller = read("app/booth/pose-guide-controller.tsx");
const overlay = read("app/booth/pose-guide-overlay.tsx");
const poseCss = read("app/booth/pose-guide.css");
const cameraCss = read("app/booth/camera.css");
const booth = read("app/booth/booth-client.tsx");
const page = read("app/booth/page.tsx");
const growth = read("lib/growth-measurement.ts");

for (const preset of ["classic-booth", "korean-date", "couple-date", "best-friends"]) {
  assert.ok(registry.includes(`presetId: "${preset}"`), `Pose Guide launch registry must include ${preset}.`);
}
for (const excluded of ["y2k-summer", "vintage-film", "polaroid-moment", "graduation"]) {
  assert.ok(!registry.includes(`presetId: "${excluded}"`), `Pose Guide V1 must not silently expand to ${excluded}.`);
}

for (const forbidden of ["landmark", "mediapipe", "tensorflow", "pose score", "body tracking", "cdn"]) {
  assert.ok(!registry.toLowerCase().includes(forbidden), `Pose Guide registry must stay static/local and exclude ${forbidden}.`);
}

assert.ok(
  page.includes("<PoseGuideController") && page.includes('import "./pose-guide.css"'),
  "Booth route must mount the Pose Guide companion and its styles.",
);
assert.ok(
  controller.includes('document.querySelector<HTMLElement>(".camera-surface")') && controller.includes("createPortal("),
  "Pose Guide must render into the existing camera surface rather than owning another camera preview.",
);
assert.ok(
  controller.includes('emitProductEvent("style_changed"') &&
    controller.includes('style_type: "pose_guide"'),
  "Pose Guide interaction measurement must reuse the existing product analytics event path.",
);
assert.ok(
  controller.includes("camera_permission_granted") &&
    controller.includes("capture_started") &&
    controller.includes("photo_captured") &&
    controller.includes("capture_completed"),
  "Pose Guide must follow the existing camera lifecycle instead of creating a parallel capture state machine.",
);
assert.ok(
  controller.includes("selectedReviewIndex()") && controller.includes("review-workspace__retake-one"),
  "Camera retakes must recover the selected shot index for the matching pose guide.",
);

assert.ok(
  overlay.includes("<svg") && overlay.includes("Pose Guide") && !overlay.includes("<img"),
  "Pose artwork must be local scalable line art, not a remote image dependency.",
);
assert.ok(
  poseCss.includes("z-index: 4") && poseCss.includes("pointer-events: none") &&
    cameraCss.includes(".camera-countdown") && cameraCss.includes("z-index: 9") &&
    cameraCss.includes(".capture-flash") && cameraCss.includes("z-index: 10"),
  "Countdown and capture flash must remain above non-interactive pose artwork.",
);

assert.ok(
  booth.includes("context.drawImage(video, 0, 0, width, height)") &&
    !booth.includes("PoseGuideOverlay") &&
    !booth.includes("pose-guide-controller") &&
    !booth.includes("pose-guide-overlay"),
  "Camera capture must continue drawing only video pixels and stay unaware of Pose Guide DOM.",
);
assert.ok(
  !read("lib/compositor.ts").includes("pose_guide") && !read("lib/compositor.ts").includes("PoseGuide"),
  "Final PNG compositor must remain unaware of Pose Guide presentation state.",
);

for (const value of ["none", "guided", "customized", "disabled"]) {
  assert.ok(profile.includes(`"${value}"`), `Pose Guide aggregate profile must include bounded value ${value}.`);
}
assert.ok(
  growth.includes('payload.pose_guide_profile') && growth.includes("readPoseGuideProfile()"),
  "Growth outcomes must carry the bounded Pose Guide profile.",
);
assert.ok(
  growth.includes('payload.capture_source === "upload"') && growth.includes('? "none"'),
  "Upload-only captures must not inherit stale camera Pose Guide attribution.",
);
for (const forbidden of ["body_landmark", "pose_coordinates", "raw_pose", "camera_frame", "base64", "filename"]) {
  assert.ok(!profile.includes(forbidden), `Pose Guide profile store must not contain ${forbidden}.`);
}

console.log("Pose Guide V1 registry, camera isolation, lifecycle, UI and privacy contracts passed.");
