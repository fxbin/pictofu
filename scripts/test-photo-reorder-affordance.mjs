import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const picker = readFileSync("app/booth/photo-selection-picker.tsx", "utf8");
const styles = readFileSync("app/booth/photo-selection-picker.module.css", "utf8");

assert.match(picker, /<strong>Photos<\/strong>/, "The Photos tool must use one unified photo surface.");
assert.doesNotMatch(picker, />Final order</, "The duplicate Final order section must stay removed.");
assert.doesNotMatch(picker, />All captures</, "The duplicate All captures section must stay removed.");
assert.match(
  picker,
  /const displayPhotos = \[\.\.\.effectiveSelectedPhotos, \.\.\.unselectedPhotos\]/,
  "Selected final-order photos and extra captures must share one grid.",
);
assert.match(
  picker,
  /className=\{styles\.photoGrid\}[\s\S]*displayPhotos\.map/,
  "Selection and ordering must render through the same photo grid.",
);
assert.match(
  picker,
  /Drag selected photos to reorder · × to replace/,
  "The unified surface must explain reorder and replacement without a second gallery.",
);

assert.match(picker, /createPortal\(/, "Natural drag must render a viewport-level floating preview.");
assert.match(picker, /dragOverlayRef/, "The floating drag preview needs a stable DOM ref for pointer-follow motion.");
assert.match(
  picker,
  /translate3d\(\$\{left\}px, \$\{top\}px, 0\) rotate\(1\.2deg\) scale\(1\.035\)/,
  "The floating preview must follow the pointer with compositor-friendly translate3d motion.",
);
assert.match(
  picker,
  /setPreviewIndexes\(\[\.\.\.drag\.previewIndexes\]\)/,
  "Dragging must maintain a local preview order before committing.",
);
assert.match(
  picker,
  /if \(commit && drag\.activated\) onChange\(drag\.previewIndexes\)/,
  "The final selectedIndexes order must commit once when the drag ends.",
);

const continueStart = picker.indexOf("function continueOrderDrag");
const finishStart = picker.indexOf("function finishOrderDrag");
assert.ok(continueStart >= 0 && finishStart > continueStart, "Drag lifecycle functions must remain present.");
assert.ok(
  !picker.slice(continueStart, finishStart).includes("onChange("),
  "Pointer-move must not live-commit selectedIndexes; doing so makes the dragged card jump with React reflow.",
);

assert.match(
  picker,
  /onPointerCancel=\{\(event\) => finishOrderDrag\(event, false\)\}/,
  "Cancelled drags must restore the committed order rather than applying the preview.",
);
assert.match(
  picker,
  /aria-keyshortcuts=\{targetCount > 1 \? "ArrowLeft ArrowRight Home End" : undefined\}/,
  "Keyboard ordering must remain available for multi-photo layouts.",
);
assert.match(
  picker,
  /if \(\(event\.target as HTMLElement\)\.closest\("button"\)\) return;/,
  "Remove-photo controls must never accidentally start a drag.",
);
assert.match(picker, /useLayoutEffect\(/, "Preview reordering must retain FLIP-style layout motion.");
assert.match(
  picker,
  /card\.animate\([\s\S]*duration: 190[\s\S]*cubic-bezier\(\.2,\.8,\.2,1\)/,
  "Other photo cards must glide into preview positions while the floating card stays under the pointer.",
);
assert.match(picker, /prefers-reduced-motion: reduce/, "JS layout motion must respect reduced motion.");

assert.match(styles, /\.photoCardSelected\s*\{[\s\S]*touch-action: pan-y/);
assert.match(
  styles,
  /\.photoCardDragging\s*\{[\s\S]*border: 1px dashed[\s\S]*transform: none/,
  "The in-grid source must become a stable placeholder instead of pretending to be the dragged object.",
);
assert.match(
  styles,
  /\.photoCardDragging \.photoPreview::after\s*\{[\s\S]*content: "Drop here"/,
  "The preview destination must be visible inside the unified grid.",
);
assert.match(
  styles,
  /\.dragOverlay\s*\{[\s\S]*position: fixed[\s\S]*z-index: 1000[\s\S]*pointer-events: none[\s\S]*will-change: transform/,
  "The dragged photo must be an independent viewport overlay optimized for smooth transforms.",
);
assert.match(
  styles,
  /\.photoCardUnselected\s*\{[\s\S]*cursor: pointer/,
  "Extra captures must remain selectable in the same surface.",
);
assert.doesNotMatch(styles, /\.orderRail|\.captureRail/, "Legacy duplicated rails must stay removed.");
assert.match(
  styles,
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.photoCard,[\s\S]*\.photoCard > strong,[\s\S]*\.dragHint[\s\S]*transition: none/,
  "CSS feedback must also honor reduced motion.",
);

console.log("Unified Photos selection and natural floating-drag contracts passed.");
