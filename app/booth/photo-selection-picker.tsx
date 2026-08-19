import { useLayoutEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
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
  activated: boolean;
  indexes: number[];
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
  const orderRailRef = useRef<HTMLDivElement | null>(null);
  const orderDragRef = useRef<OrderDrag | null>(null);
  const previousOrderRectsRef = useRef(new Map<number, DOMRect>());
  const [pressedPhotoIndex, setPressedPhotoIndex] = useState<number | null>(null);
  const [draggingPhotoIndex, setDraggingPhotoIndex] = useState<number | null>(null);
  const [dragTargetPosition, setDragTargetPosition] = useState<number | null>(null);

  if (photos.length <= 1 || targetCount < 1) return null;

  const selectedPhotos = selectedIndexes
    .map((index) => photos.find((photo) => photo.index === index))
    .filter((photo): photo is PhotoSelectionChoice => Boolean(photo));
  const complete = selectedPhotos.length === targetCount;
  const orderKey = selectedIndexes.join(",");

  useLayoutEffect(() => {
    const rail = orderRailRef.current;
    if (!rail) return;

    const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-photo-index]"));
    const nextRects = new Map<number, DOMRect>();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cards.forEach((card) => {
      const photoIndex = Number(card.dataset.photoIndex);
      if (!Number.isInteger(photoIndex)) return;
      const nextRect = card.getBoundingClientRect();
      const previousRect = previousOrderRectsRef.current.get(photoIndex);
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
        { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    });

    previousOrderRectsRef.current = nextRects;
  }, [orderKey, draggingPhotoIndex]);

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

  function moveSelected(indexes: number[], position: number, nextPosition: number) {
    const next = moveItem(indexes, position, nextPosition);
    if (next === indexes) return indexes;
    onChange(next);
    return next;
  }

  function closestOrderPosition(clientX: number, clientY: number) {
    const cards = Array.from(
      orderRailRef.current?.querySelectorAll<HTMLElement>("[data-order-position]") ?? [],
    );
    let closestPosition = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const position = Number(card.dataset.orderPosition);
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

  function beginOrderDrag(
    event: ReactPointerEvent<HTMLDivElement>,
    photoIndex: number,
    position: number,
  ) {
    if (disabled || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setPressedPhotoIndex(photoIndex);
    setDragTargetPosition(position);
    orderDragRef.current = {
      pointerId: event.pointerId,
      photoIndex,
      currentPosition: position,
      startX: event.clientX,
      startY: event.clientY,
      activated: false,
      indexes: [...selectedIndexes],
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
    }

    event.preventDefault();
    const nextPosition = closestOrderPosition(event.clientX, event.clientY);
    if (nextPosition < 0 || nextPosition === drag.currentPosition) return;

    setDragTargetPosition(nextPosition);
    drag.indexes = moveSelected(drag.indexes, drag.currentPosition, nextPosition);
    drag.currentPosition = nextPosition;
  }

  function endOrderDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = orderDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    orderDragRef.current = null;
    setPressedPhotoIndex(null);
    setDraggingPhotoIndex(null);
    setDragTargetPosition(null);
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
    if (event.key === "End") nextPosition = selectedPhotos.length - 1;
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

  return (
    <div className={styles.picker} aria-label="Choose and arrange photos for this layout">
      <div className={styles.heading}>
        <div>
          <strong>{targetCount === 1 ? "Choose your photo" : "Choose & arrange photos"}</strong>
          <span>
            {targetCount === 1
              ? `Photo ${(selectedIndexes[0] ?? 0) + 1} will be used`
              : complete
                ? `${targetCount} selected · order matches the final layout`
                : `Choose ${targetCount - selectedPhotos.length} more ${targetCount - selectedPhotos.length === 1 ? "photo" : "photos"}`}
          </span>
        </div>
        <em className={complete ? styles.statusComplete : styles.statusIncomplete}>
          {selectedPhotos.length}/{targetCount}
        </em>
      </div>

      {targetCount > 1 && (
        <div className={styles.orderSection}>
          <div className={styles.sectionLabel}>
            <strong>Final order</strong>
            <span>Hold and drag a photo to reorder</span>
          </div>
          <div className={styles.orderRail} ref={orderRailRef} role="list">
            {Array.from({ length: targetCount }).map((_, position) => {
              const photo = selectedPhotos[position];
              if (!photo) {
                return (
                  <div className={styles.emptySlot} key={`empty-${position}`} aria-label={`Final position ${position + 1} is empty`}>
                    <span>{position + 1}</span>
                    <small>Choose</small>
                  </div>
                );
              }

              const pressed = pressedPhotoIndex === photo.index;
              const dragging = draggingPhotoIndex === photo.index;
              const dropTarget = draggingPhotoIndex !== null && dragTargetPosition === position;
              return (
                <div
                  className={`${styles.orderCard} ${pressed ? styles.orderCardPressed : ""} ${dragging ? styles.orderCardDragging : ""} ${dropTarget ? styles.orderCardDropTarget : ""}`}
                  key={photo.id}
                  data-order-position={position}
                  data-photo-index={photo.index}
                  role="listitem"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={`Photo ${photo.index + 1}, final position ${position + 1}. Hold and drag to reorder or use left and right arrow keys.`}
                  aria-keyshortcuts="ArrowLeft ArrowRight Home End"
                  onPointerDown={(event) => beginOrderDrag(event, photo.index, position)}
                  onPointerMove={continueOrderDrag}
                  onPointerUp={endOrderDrag}
                  onPointerCancel={endOrderDrag}
                  onLostPointerCapture={endOrderDrag}
                  onKeyDown={(event) => handleOrderKeyDown(event, position)}
                >
                  <div className={styles.orderPreview} style={{ aspectRatio: String(targetRatio) }}>
                    {preview(photo)}
                    <span className={styles.dragHandle} aria-hidden="true"><b>⠿</b><small>Drag</small></span>
                    <span className={styles.positionBadge}>{position + 1}</span>
                    {dragging && dragTargetPosition !== null && (
                      <span className={styles.dropTargetBadge} aria-hidden="true">Release · #{dragTargetPosition + 1}</span>
                    )}
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => togglePhoto(photo.index)}
                      disabled={disabled}
                      aria-label={`Remove photo ${photo.index + 1} from the final layout`}
                    >
                      ×
                    </button>
                  </div>
                  <strong>Photo {photo.index + 1}</strong>
                </div>
              );
            })}
          </div>
          <p className={`${styles.orderHint} ${draggingPhotoIndex !== null ? styles.orderHintActive : ""}`} aria-live="polite">
            {draggingPhotoIndex !== null && dragTargetPosition !== null
              ? `Release for final position ${dragTargetPosition + 1}`
              : "Hold the Drag handle and move left or right · keyboard: ← →"}
          </p>
        </div>
      )}

      <div className={styles.captureSection}>
        {targetCount > 1 && (
          <div className={styles.sectionLabel}>
            <strong>All captures</strong>
            <span>{selectedPhotos.length >= targetCount ? "Remove one above to replace it" : "Tap to add"}</span>
          </div>
        )}
        <div className={styles.captureRail}>
          {photos.map((photo) => {
            const selectedPosition = selectedIndexes.indexOf(photo.index);
            const selected = selectedPosition >= 0;
            const blocked = !selected && targetCount > 1 && selectedIndexes.length >= targetCount;
            return (
              <button
                className={`${styles.choice} ${selected ? styles.choiceSelected : ""}`}
                type="button"
                key={photo.id}
                onClick={() => togglePhoto(photo.index)}
                disabled={disabled || blocked}
                aria-pressed={selected}
                aria-label={`${selected ? "Remove" : "Use"} photo ${photo.index + 1}${selected ? ` in position ${selectedPosition + 1}` : ""}`}
              >
                <span style={{ display: "block", position: "relative", overflow: "hidden", aspectRatio: String(targetRatio), borderRadius: 8 }}>
                  {preview(photo)}
                </span>
                <span>Photo {photo.index + 1}</span>
                {selected && <b aria-hidden="true">{selectedPosition + 1}</b>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
