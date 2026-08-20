import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { PhotoPreview } from "./photo-preview";
import type { PhotoAdjustment } from "@/lib/compositor";
import styles from "./photo-selection-picker.module.css";

export type PhotoSelectionChoice = {
  index: number;
  id: string;
  url: string;
  width: number;
  height: number;
  adjustment: PhotoAdjustment;
};

type PhotoSelectionPickerProps = {
  photos: PhotoSelectionChoice[];
  selectedIndexes: number[];
  targetCount: number;
  targetRatio: number;
  filter: string;
  disabled?: boolean;
  onChange: (indexes: number[]) => void;
};

type DragSlot = {
  position: number;
  centerX: number;
  centerY: number;
};

type OrderDrag = {
  pointerId: number;
  photoIndex: number;
  initialPosition: number;
  currentPosition: number;
  grabOffsetX: number;
  grabOffsetY: number;
  width: number;
  height: number;
  previewIndexes: number[];
  slots: DragSlot[];
};

type DragOverlay = {
  photoIndex: number;
  width: number;
  height: number;
  left: number;
  top: number;
};

type WindowDragListeners = {
  move: (event: PointerEvent) => void;
  up: (event: PointerEvent) => void;
  cancel: (event: PointerEvent) => void;
};

function moveItem(indexes: number[], from: number, to: number) {
  if (to < 0 || to >= indexes.length || from === to) return indexes;
  const next = [...indexes];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function PhotoSelectionPicker({
  photos,
  selectedIndexes,
  targetCount,
  targetRatio,
  filter,
  disabled,
  onChange,
}: PhotoSelectionPickerProps) {
  const photoGridRef = useRef<HTMLDivElement | null>(null);
  const orderDragRef = useRef<OrderDrag | null>(null);
  const dragOverlayRef = useRef<HTMLDivElement | null>(null);
  const previousRectsRef = useRef(new Map<number, DOMRect>());
  const overlayFrameRef = useRef<number | null>(null);
  const windowDragListenersRef = useRef<WindowDragListeners | null>(null);
  const [pressedPhotoIndex, setPressedPhotoIndex] = useState<number | null>(null);
  const [draggingPhotoIndex, setDraggingPhotoIndex] = useState<number | null>(null);
  const [dragTargetPosition, setDragTargetPosition] = useState<number | null>(null);
  const [previewIndexes, setPreviewIndexes] = useState<number[] | null>(null);
  const [dragOverlay, setDragOverlay] = useState<DragOverlay | null>(null);

  const effectiveIndexes = previewIndexes ?? selectedIndexes;
  const effectiveSelectedPhotos = effectiveIndexes
    .map((index) => photos.find((photo) => photo.index === index))
    .filter((photo): photo is PhotoSelectionChoice => Boolean(photo));
  const selectedSet = new Set(effectiveIndexes);
  const unselectedPhotos = photos.filter((photo) => !selectedSet.has(photo.index));
  const displayPhotos = [...effectiveSelectedPhotos, ...unselectedPhotos];
  const complete = selectedIndexes.length === targetCount;
  const displayOrderKey = displayPhotos.map((photo) => photo.index).join(",");
  const draggingPhoto = dragOverlay
    ? photos.find((photo) => photo.index === dragOverlay.photoIndex) ?? null
    : null;

  useLayoutEffect(() => {
    const grid = photoGridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-photo-index]"));
    const nextRects = new Map<number, DOMRect>();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cards.forEach((card) => {
      const photoIndex = Number(card.dataset.photoIndex);
      if (!Number.isInteger(photoIndex)) return;
      const nextRect = card.getBoundingClientRect();
      const previousRect = previousRectsRef.current.get(photoIndex);
      nextRects.set(photoIndex, nextRect);

      if (!previousRect || reduceMotion || photoIndex === draggingPhotoIndex) return;
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

      card.getAnimations().forEach((animation) => animation.cancel());
      card.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: "translate(0, 0)" },
        ],
        { duration: 190, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    });

    previousRectsRef.current = nextRects;
  }, [displayOrderKey, draggingPhotoIndex]);

  useEffect(() => () => {
    const listeners = windowDragListenersRef.current;
    if (listeners) {
      window.removeEventListener("pointermove", listeners.move);
      window.removeEventListener("pointerup", listeners.up);
      window.removeEventListener("pointercancel", listeners.cancel);
      windowDragListenersRef.current = null;
    }
    if (overlayFrameRef.current !== null) {
      cancelAnimationFrame(overlayFrameRef.current);
      overlayFrameRef.current = null;
    }
  }, []);

  if (photos.length <= 1 || targetCount < 1) return null;

  function togglePhoto(index: number) {
    const selectedPosition = selectedIndexes.indexOf(index);
    if (targetCount === 1) {
      if (selectedPosition === 0) return;
      onChange([index]);
      return;
    }

    if (selectedPosition >= 0) {
      onChange(selectedIndexes.filter((item) => item !== index));
      return;
    }

    if (selectedIndexes.length >= targetCount) return;
    onChange([...selectedIndexes, index]);
  }

  function snapshotSelectedSlots() {
    const cards = Array.from(
      photoGridRef.current?.querySelectorAll<HTMLElement>("[data-selected-position]") ?? [],
    );

    return cards
      .map((card): DragSlot | null => {
        const position = Number(card.dataset.selectedPosition);
        if (!Number.isInteger(position)) return null;
        const rect = card.getBoundingClientRect();
        return {
          position,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        };
      })
      .filter((slot): slot is DragSlot => Boolean(slot))
      .sort((a, b) => a.position - b.position);
  }

  function stableTargetPosition(clientX: number, clientY: number, drag: OrderDrag) {
    const currentSlot = drag.slots.find((slot) => slot.position === drag.currentPosition);
    if (!currentSlot) return drag.currentPosition;

    let candidate = currentSlot;
    let candidateDistance = Math.hypot(
      clientX - currentSlot.centerX,
      clientY - currentSlot.centerY,
    );

    drag.slots.forEach((slot) => {
      const distance = Math.hypot(clientX - slot.centerX, clientY - slot.centerY);
      if (distance < candidateDistance) {
        candidate = slot;
        candidateDistance = distance;
      }
    });

    if (candidate.position === drag.currentPosition) return drag.currentPosition;

    const currentDistance = Math.hypot(
      clientX - currentSlot.centerX,
      clientY - currentSlot.centerY,
    );
    const hysteresis = 10;
    return candidateDistance + hysteresis < currentDistance
      ? candidate.position
      : drag.currentPosition;
  }

  function moveDragOverlay(clientX: number, clientY: number, drag: OrderDrag) {
    if (overlayFrameRef.current !== null) cancelAnimationFrame(overlayFrameRef.current);
    overlayFrameRef.current = requestAnimationFrame(() => {
      overlayFrameRef.current = null;
      const overlay = dragOverlayRef.current;
      if (!overlay) return;
      const left = clientX - drag.grabOffsetX;
      const top = clientY - drag.grabOffsetY;
      overlay.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(1.2deg) scale(1.035)`;
    });
  }

  function removeWindowDragListeners() {
    const listeners = windowDragListenersRef.current;
    if (!listeners) return;
    window.removeEventListener("pointermove", listeners.move);
    window.removeEventListener("pointerup", listeners.up);
    window.removeEventListener("pointercancel", listeners.cancel);
    windowDragListenersRef.current = null;
  }

  function finishOrderDrag(pointerId: number, commit: boolean) {
    const drag = orderDragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;

    removeWindowDragListeners();
    if (overlayFrameRef.current !== null) {
      cancelAnimationFrame(overlayFrameRef.current);
      overlayFrameRef.current = null;
    }
    if (commit && drag.currentPosition !== drag.initialPosition) {
      onChange([...drag.previewIndexes]);
    }

    orderDragRef.current = null;
    setPressedPhotoIndex(null);
    setDraggingPhotoIndex(null);
    setDragTargetPosition(null);
    setPreviewIndexes(null);
    setDragOverlay(null);
  }

  function continueOrderDrag(event: PointerEvent) {
    const drag = orderDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    moveDragOverlay(event.clientX, event.clientY, drag);

    const nextPosition = stableTargetPosition(event.clientX, event.clientY, drag);
    if (nextPosition === drag.currentPosition) return;

    drag.previewIndexes = moveItem(drag.previewIndexes, drag.currentPosition, nextPosition);
    drag.currentPosition = nextPosition;
    setDragTargetPosition(nextPosition);
    setPreviewIndexes([...drag.previewIndexes]);
  }

  function installWindowDragListeners() {
    removeWindowDragListeners();
    const listeners: WindowDragListeners = {
      move: (event) => continueOrderDrag(event),
      up: (event) => finishOrderDrag(event.pointerId, true),
      cancel: (event) => finishOrderDrag(event.pointerId, false),
    };
    window.addEventListener("pointermove", listeners.move, { passive: false });
    window.addEventListener("pointerup", listeners.up);
    window.addEventListener("pointercancel", listeners.cancel);
    windowDragListenersRef.current = listeners;
  }

  function beginOrderDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    photoIndex: number,
    position: number,
  ) {
    if (disabled || event.button !== 0 || selectedIndexes.length <= 1) return;

    const card = event.currentTarget.closest("[data-photo-index]") as HTMLDivElement | null;
    if (!card) return;
    const slots = snapshotSelectedSlots();
    if (slots.length !== selectedIndexes.length) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = card.getBoundingClientRect();
    const drag: OrderDrag = {
      pointerId: event.pointerId,
      photoIndex,
      initialPosition: position,
      currentPosition: position,
      grabOffsetX: event.clientX - rect.left,
      grabOffsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      previewIndexes: [...selectedIndexes],
      slots,
    };

    orderDragRef.current = drag;
    setPressedPhotoIndex(photoIndex);
    setDraggingPhotoIndex(photoIndex);
    setDragTargetPosition(position);
    setPreviewIndexes([...drag.previewIndexes]);
    setDragOverlay({
      photoIndex,
      width: rect.width,
      height: rect.height,
      left: event.clientX - drag.grabOffsetX,
      top: event.clientY - drag.grabOffsetY,
    });
    installWindowDragListeners();
  }

  function handleOrderKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
    position: number,
  ) {
    if (disabled || event.target !== event.currentTarget) return;

    let nextPosition = position;
    if (event.key === "ArrowLeft") nextPosition = position - 1;
    if (event.key === "ArrowRight") nextPosition = position + 1;
    if (event.key === "Home") nextPosition = 0;
    if (event.key === "End") nextPosition = selectedIndexes.length - 1;
    if (nextPosition === position) return;

    const next = moveItem(selectedIndexes, position, nextPosition);
    if (next === selectedIndexes) return;
    event.preventDefault();
    onChange(next);
  }

  function preview(photo: PhotoSelectionChoice) {
    return (
      <PhotoPreview
        url={photo.url}
        imageWidth={photo.width}
        imageHeight={photo.height}
        adjustment={photo.adjustment}
        targetRatio={targetRatio}
        filter={filter}
      />
    );
  }

  const selectionHelp = targetCount === 1
    ? "Tap the photo you want to use"
    : complete
      ? "Drag from ⠿ to reorder · × to replace"
      : `Choose ${targetCount - selectedIndexes.length} more ${targetCount - selectedIndexes.length === 1 ? "photo" : "photos"}`;

  return (
    <div className={styles.picker} aria-label="Choose and arrange photos for this layout">
      <div className={styles.heading}>
        <div>
          <strong>Photos</strong>
          <span>{selectionHelp}</span>
        </div>
        <em className={complete ? styles.statusComplete : styles.statusIncomplete}>
          {selectedIndexes.length}/{targetCount}
        </em>
      </div>

      <div className={styles.photoGrid} ref={photoGridRef} role="list">
        {displayPhotos.map((photo) => {
          const selectedPosition = effectiveIndexes.indexOf(photo.index);
          const selected = selectedPosition >= 0;
          const pressed = pressedPhotoIndex === photo.index;
          const dragging = draggingPhotoIndex === photo.index;
          const dropTarget = draggingPhotoIndex !== null && selected && dragTargetPosition === selectedPosition;
          const blocked = !selected && targetCount > 1 && selectedIndexes.length >= targetCount;

          if (!selected) {
            return (
              <button
                className={`${styles.photoCard} ${styles.photoCardUnselected}`}
                type="button"
                key={photo.id}
                data-photo-index={photo.index}
                onClick={() => togglePhoto(photo.index)}
                disabled={disabled || blocked}
                aria-label={blocked
                  ? `Photo ${photo.index + 1}. Remove a selected photo before using this capture.`
                  : `Use photo ${photo.index + 1}`}
              >
                <span className={styles.photoPreview} style={{ aspectRatio: String(targetRatio) }}>
                  {preview(photo)}
                  <span className={styles.useBadge} aria-hidden="true">+</span>
                </span>
                <strong>Photo {photo.index + 1}</strong>
              </button>
            );
          }

          return (
            <div
              className={`${styles.photoCard} ${styles.photoCardSelected} ${pressed ? styles.photoCardPressed : ""} ${dragging ? styles.photoCardDragging : ""} ${dropTarget ? styles.photoCardDropTarget : ""}`}
              key={photo.id}
              data-photo-index={photo.index}
              data-selected-position={selectedPosition}
              role="listitem"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Photo ${photo.index + 1}, final position ${selectedPosition + 1}.${targetCount > 1 ? " Use the drag handle to reorder or use left and right arrow keys." : ""}`}
              aria-keyshortcuts={targetCount > 1 ? "ArrowLeft ArrowRight Home End" : undefined}
              onKeyDown={(event) => handleOrderKeyDown(event, selectedPosition)}
            >
              <div className={styles.photoPreview} style={{ aspectRatio: String(targetRatio) }}>
                {preview(photo)}
                {targetCount > 1 && selectedIndexes.length > 1 && (
                  <button
                    type="button"
                    className={styles.dragHandle}
                    onPointerDown={(event) => beginOrderDrag(event, photo.index, selectedPosition)}
                    disabled={disabled}
                    aria-label={`Drag photo ${photo.index + 1} from final position ${selectedPosition + 1}`}
                  >
                    ⠿
                  </button>
                )}
                <span className={styles.positionBadge}>{selectedPosition + 1}</span>
                {targetCount > 1 && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => togglePhoto(photo.index)}
                    disabled={disabled}
                    aria-label={`Remove photo ${photo.index + 1} from the layout`}
                  >
                    ×
                  </button>
                )}
              </div>
              <strong>Photo {photo.index + 1}</strong>
            </div>
          );
        })}
      </div>

      {targetCount > 1 && (
        <p className={`${styles.dragHint} ${draggingPhotoIndex !== null ? styles.dragHintActive : ""}`} aria-live="polite">
          {draggingPhotoIndex !== null && dragTargetPosition !== null
            ? `Position ${dragTargetPosition + 1} of ${selectedIndexes.length} · release to place`
            : "Press ⠿ and drag a selected photo to change the final order"}
        </p>
      )}

      {dragOverlay && draggingPhoto && typeof document !== "undefined" && createPortal(
        <div
          ref={dragOverlayRef}
          className={styles.dragOverlay}
          style={{
            width: dragOverlay.width,
            height: dragOverlay.height,
            opacity: 1,
            transform: `translate3d(${dragOverlay.left}px, ${dragOverlay.top}px, 0) rotate(1.2deg) scale(1.035)`,
          }}
          aria-hidden="true"
        >
          <div className={styles.photoPreview} style={{ aspectRatio: String(targetRatio) }}>
            {preview(draggingPhoto)}
            <span className={styles.overlayGrip}>⠿</span>
            {dragTargetPosition !== null && (
              <span className={styles.positionBadge}>{dragTargetPosition + 1}</span>
            )}
          </div>
          <strong>Photo {draggingPhoto.index + 1}</strong>
        </div>,
        document.body,
      )}
    </div>
  );
}
