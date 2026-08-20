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
  /Drag from ⠿ to reorder · × to replace/,
  "The unified surface must point users to the dedicated drag handle.",
);

assert.match(picker, /createPortal\(/, "Natural drag must render a viewport-level floating preview.");
assert.match(picker, /dragOverlayRef/, "The floating drag preview needs a stable DOM ref for pointer-follow motion.");
assert.match(
  picker,
  /translate3d\(\$\{left\}px, \$\{top\}px, 0\) rotate\(1\.2deg\) scale\(1\.035\)/,
  "Pointer moves must update the floating preview with compositor-friendly translate3d motion.",
);
assert.match(
  picker,
  /transform: `translate3d\(\$\{dragOverlay\.left\}px, \$\{dragOverlay\.top\}px, 0\) rotate\(1\.2deg\) scale\(1\.035\)`/,
  "The first floating-preview render must already be positioned under the pointer.",
);
assert.match(
  picker,
  /setDraggingPhotoIndex\(photoIndex\)[\s\S]*setDragOverlay\(\{/,
  "Pressing the drag handle must activate lift feedback immediately without a movement threshold.",
);
assert.doesNotMatch(
  picker,
  /Math\.hypot\(deltaX, deltaY\) <|Math\.abs\(deltaY\) > Math\.abs\(deltaX\)/,
  "Dedicated-handle dragging must not wait for movement or direction thresholds.",
);

assert.match(
  picker,
  /function snapshotSelectedSlots\(\)[\s\S]*getBoundingClientRect\(\)[\s\S]*centerX:[\s\S]*centerY:/,
  "Selected destination slots must be frozen before preview reordering begins.",
);
assert.match(
  picker,
  /function stableTargetPosition\(clientX: number, clientY: number, drag: OrderDrag\)/,
  "Pointer hit-testing must use the frozen drag slots.",
);
assert.match(
  picker,
  /const hysteresis = 10;/,
  "Frozen-slot targeting must include hysteresis so pointer jitter cannot rapidly toggle adjacent positions.",
);
const stableTargetStart = picker.indexOf("function stableTargetPosition");
const moveOverlayStart = picker.indexOf("function moveDragOverlay");
assert.ok(stableTargetStart >= 0 && moveOverlayStart > stableTargetStart);
assert.ok(
  !picker.slice(stableTargetStart, moveOverlayStart).includes("getBoundingClientRect"),
  "Destination hit-testing must never read live card geometry after the drag starts.",
);
assert.match(
  picker,
  /const slots = snapshotSelectedSlots\(\);[\s\S]*slots,/,
  "The drag session must retain one frozen set of slot centers for the full gesture.",
);

assert.match(
  picker,
  /if \(commit && drag\.currentPosition !== drag\.initialPosition\) \{[\s\S]*onChange\(\[\.\.\.drag\.previewIndexes\]\)/,
  "The final selectedIndexes order must commit once, and only when its position actually changed.",
);
const continueStart = picker.indexOf("function continueOrderDrag");
const installStart = picker.indexOf("function installWindowDragListeners");
assert.ok(continueStart >= 0 && installStart > continueStart, "Drag movement and window-listener lifecycle functions must remain present.");
assert.ok(
  !picker.slice(continueStart, installStart).includes("onChange("),
  "Pointer-move must not live-commit selectedIndexes.",
);

assert.match(
  picker,
  /window\.addEventListener\("pointermove", listeners\.move, \{ passive: false \}\)/,
  "Window must own pointer movement so card reflow cannot terminate the gesture.",
);
assert.match(
  picker,
  /window\.addEventListener\("pointerup", listeners\.up\)/,
  "Window must own pointerup so the final order commits even after the source card moves in the DOM.",
);
assert.match(
  picker,
  /window\.addEventListener\("pointercancel", listeners\.cancel\)/,
  "Browser pointer cancellation must restore committed order.",
);
assert.match(
  picker,
  /window\.removeEventListener\("pointermove", listeners\.move\)[\s\S]*window\.removeEventListener\("pointerup", listeners\.up\)[\s\S]*window\.removeEventListener\("pointercancel", listeners\.cancel\)/,
  "Global drag listeners must always be removable.",
);
assert.doesNotMatch(
  picker,
  /setPointerCapture|releasePointerCapture|onLostPointerCapture/,
  "Reorder must not depend on pointer capture owned by a card whose DOM position changes.",
);
assert.match(
  picker,
  /className=\{styles\.dragHandle\}[\s\S]*onPointerDown=\{\(event\) => beginOrderDrag\(event, photo\.index, selectedPosition\)\}/,
  "Only the explicit drag handle should start pointer reordering.",
);
assert.doesNotMatch(
  picker,
  /aria-keyshortcuts[\s\S]{0,300}onPointerDown=/,
  "The selected card itself must not own drag pointerdown; card body remains scroll-friendly.",
);
assert.match(
  picker,
  /aria-keyshortcuts=\{targetCount > 1 \? "ArrowLeft ArrowRight Home End" : undefined\}/,
  "Keyboard ordering must remain available for multi-photo layouts.",
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
  /\.dragHandle\s*\{[\s\S]*width: 30px;[\s\S]*height: 30px;[\s\S]*background: transparent;[\s\S]*touch-action: none/,
  "The handle must keep a generous 30px transparent touch target even when its visible chip is smaller.",
);
assert.match(
  styles,
  /\.dragHandle::before\s*\{[\s\S]*content: "⠿";[\s\S]*width: 20px;[\s\S]*height: 20px;/,
  "The visible drag chip should be only 20px so it does not cover the thumbnail.",
);
assert.match(
  styles,
  /\.overlayGrip\s*\{[\s\S]*width: 20px;[\s\S]*height: 20px;/,
  "The floating preview grip must match the reduced visible footprint.",
);
assert.match(
  styles,
  /@media \(max-width: 390px\)[\s\S]*\.dragHandle\s*\{[\s\S]*width: 30px;[\s\S]*height: 30px;[\s\S]*\.dragHandle::before,[\s\S]*\.overlayGrip\s*\{[\s\S]*width: 18px;[\s\S]*height: 18px;/,
  "Very narrow screens may shrink the visible chip further without shrinking the touch target.",
);
assert.match(
  styles,
  /\.photoCardDragging\s*\{[\s\S]*border: 1px dashed[\s\S]*transform: none/,
  "The in-grid source must become a stable placeholder.",
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
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.photoCard,[\s\S]*\.photoCard > strong,[\s\S]*\.dragHandle::before,[\s\S]*\.dragHint[\s\S]*transition: none/,
  "CSS feedback must also honor reduced motion.",
);

console.log("Unified Photos selection, immediate stable drag, and compact visual-handle contracts passed.");
