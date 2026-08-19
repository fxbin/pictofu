import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const picker = readFileSync("app/booth/photo-selection-picker.tsx", "utf8");
const styles = readFileSync("app/booth/photo-selection-picker.module.css", "utf8");

assert.match(
  picker,
  /Hold and drag a photo to reorder/,
  "Final-order guidance must explicitly teach the drag gesture.",
);
assert.match(
  picker,
  /<b>⠿<\/b><small>Drag<\/small>/,
  "Every draggable final-order card must expose a visible Drag handle label.",
);
assert.match(
  picker,
  /pressedPhotoIndex[\s\S]*draggingPhotoIndex[\s\S]*dragTargetPosition/,
  "Reorder interaction must distinguish press, active drag, and destination feedback states.",
);
assert.match(
  picker,
  /Release · #\{dragTargetPosition \+ 1\}/,
  "The dragged card must show the live final position before release.",
);
assert.match(
  picker,
  /Release for final position \$\{dragTargetPosition \+ 1\}/,
  "The reorder hint must announce the live final position.",
);
assert.match(
  picker,
  /useLayoutEffect\([\s\S]*data-photo-index[\s\S]*card\.animate\(/,
  "Non-dragging cards must use a FLIP-style transition when live ordering changes their slots.",
);
assert.match(
  picker,
  /prefers-reduced-motion: reduce/,
  "FLIP reordering must respect the user's reduced-motion preference.",
);
assert.match(
  picker,
  /if \(photos\.length <= 1 \|\| targetCount < 1\) return null;/,
  "Single-photo layouts may still skip the reorder surface.",
);
assert.ok(
  picker.indexOf("useLayoutEffect(() =>") < picker.indexOf("if (photos.length <= 1 || targetCount < 1) return null;"),
  "Reorder animation hooks must remain unconditional before the early return.",
);

assert.match(
  styles,
  /\.orderCardPressed\s*\{[\s\S]*translateY\(-2px\) scale\(1\.025\)/,
  "Pointer down must immediately lift the photo before drag activation.",
);
assert.match(
  styles,
  /\.orderCardDragging\s*\{[\s\S]*opacity: 1[\s\S]*outline: 2px[\s\S]*translateY\(-6px\) scale\(1\.06\)/,
  "Active drag must stay fully opaque and use a stronger lift/outline state.",
);
assert.doesNotMatch(
  styles,
  /\.orderCardDragging\s*\{[\s\S]*?opacity:\s*\.78/,
  "Dragging must not fade the object the user is trying to follow.",
);
assert.match(
  styles,
  /\.orderCardDropTarget \.orderPreview\s*\{[\s\S]*inset 0 0 0 3px/,
  "The current destination must receive a visible target outline.",
);
assert.match(
  styles,
  /\.dragHandle\s*\{[\s\S]*min-width: 52px[\s\S]*height: 28px/,
  "The Drag affordance must be substantially larger than the legacy icon-only handle.",
);
assert.match(
  styles,
  /\.removeButton\s*\{[\s\S]*right: 5px[\s\S]*bottom: 5px/,
  "The remove control must stay clear of the enlarged top-left Drag handle.",
);
assert.match(styles, /touch-action: pan-y/);
assert.match(
  styles,
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.orderCard,[\s\S]*\.orderPreview,[\s\S]*\.orderHint[\s\S]*transition: none/,
  "CSS reorder feedback must also honor reduced motion.",
);

console.log("Photo reorder drag affordance and motion feedback contracts passed.");
