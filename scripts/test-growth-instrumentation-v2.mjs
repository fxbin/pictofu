import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const events = readFileSync("lib/growth-events.ts", "utf8");
const analytics = readFileSync("lib/analytics.ts", "utf8");

for (const event of [
  "preset_selected",
  "layout_selected",
  "filter_selected",
  "frame_selected",
  "share_completed",
  "share_landing_view",
  "share_to_booth",
]) {
  assert.match(events, new RegExp(event));
}

for (const event of ["landing_view", "start_booth", "export_completed", "share_clicked"]) {
  assert.match(analytics, new RegExp(event));
}

console.log("Growth instrumentation v2 contracts passed.");
