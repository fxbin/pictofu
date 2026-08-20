import { useLayoutEffect, useRef, useState } from "react";
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

type OrderDrag = {
  pointerId: number;
  photoIndex: number;
  currentPosition: number;
  startX: number;
  startY: number;
  grabOffsetX: number;
  grabOffsetY: number;
  width: number;
  height: number;
  activated: boolean;
  previewIndexes: number[];
};

type DragOverlay = {
  photoIndex: number;
  width: number;
  height: number;
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

  function closestSelectedPosition(clientX: number, clientY: number) {
    const cards = Array.from(
      photoGridRef.current?.querySelectorAll<HTMLElement>("[data-selected-position]") ?? [],
    );
    let closestPosition = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const position = Number(card.dataset.selectedPosition);
      if (!Number.isInteger(position)) return;
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(clientX - centerX, clientY - centerY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPosition = position;
      }
    });

    return closestPosition;
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

  function beginOrderDrag(
    event: ReactPointerEvent<HTMLDivElement>,
    photoIndex: number,
    position: number,
  ) {
    if (disabled || event.button !== 0 || selectedIndexes.length <= 1) return;
    if ((event.target as HTMLElement).closest("button")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    setPressedPhotoIndex(photoIndex);
    orderDragRef.current = {
      pointerId: event.pointerId,
      photoIndex,
      currentPosition: position,
      startX: event.clientX,
      startY: event.clientY,
      grabOffsetX: event.clientX - rect.left,
      grabOffsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      activated: false,
      previewIndexes: [...selectedIndexes],
    };
  }

  function continueOrderDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = orderDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!drag.activated) {
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      if (Math.hypot(deltaX, deltaY) < 6) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;

      drag.activated = true;
      setDraggingPhotoIndex(drag.photoIndex);
      setDragTargetPosition(drag.currentPosition);
      setPreviewIndexes([...drag.previewIndexes]);
      setDragOverlay({
        photoIndex: drag.photoIndex,
        width: drag.width,
        height: drag.height,
      });
      requestAnimationFrame(() => moveDragOverlay(event.clientX, event.clientY, drag));
    }

    event.preventDefault();
    moveDragOverlay(event.clientX, event.clientY, drag);

    const nextPosition = closestSelectedPosition(event.clientX, event.clientY);
    if (nextPosition < 0 || nextPosition === drag.currentPosition) return;

    drag.previewIndexes = moveItem(drag.previewIndexes, drag.currentPosition, nextPosition);
    drag.currentPosition = nextPosition;
    setDragTargetPosition(nextPosition);
    setPreviewIndexes([...drag.previewIndexes]);
  }

  function finishOrderDrag(event: ReactPointerEvent<HTMLDivElement>, commit: boolean) {
    const drag = orderDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (overlayFrameRef.current !== null) {
      cancelAnimationFrame(overlayFrameRef.current);
      overlayFrameRef.current = null;
    }
    if (commit && drag.activated) onChange(drag.previewIndexes);

    orderDragRef.current = null;
    setPressedPhotoIndex(null);
    setDraggingPhotoIndex(null);
    setDragTargetPosition(null);
    setPreviewIndexes(null);
    setDragOverlay(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
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
      ? "Drag selected photos to reorder · × to replace"
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
              aria-label={`Photo ${photo.index + 1}, final position ${selectedPosition + 1}.${targetCount > 1 ? " Drag to reorder or use left and right arrow keys." : ""}`}
              aria-keyshortcuts={targetCount > 1 ? "ArrowLeft ArrowRight Home End" : undefined}
              onPointerDown={(event) => beginOrderDrag(event, photo.index, selectedPosition)}
              onPointerMove={continueOrderDrag}
              onPointerUp={(event) => finishOrderDrag(event, true)}
              onPointerCancel={(event) => finishOrderDrag(event, false)}
              onLostPointerCapture={(event) => finishOrderDrag(event, false)}
              onKeyDown={(event) => handleOrderKeyDown(event, selectedPosition)}
            >
              <div className={styles.photoPreview} style={{ aspectRatio: String(targetRatio) }}>
                {preview(photo)}
                {targetCount > 1 && selectedIndexes.length > 1 && (
                  <span className={styles.dragCue} aria-hidden="true">⠿</span>
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
            : "Drag a selected photo left or right to change the final order"}
        </p>
      )}

      {dragOverlay && draggingPhoto && typeof document !== "undefined" && createPortal(
        <div
          ref={dragOverlayRef}
          className={styles.dragOverlay}
          style={{ width: dragOverlay.width, height: dragOverlay.height }}
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
