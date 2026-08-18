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
  if (photos.length <= 1 || targetCount < 1) return null;

  const selectedPhotos = selectedIndexes
    .map((index) => photos.find((photo) => photo.index === index))
    .filter((photo): photo is PhotoSelectionChoice => Boolean(photo));
  const complete = selectedPhotos.length === targetCount;

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

  function moveSelected(position: number, direction: -1 | 1) {
    onChange(moveItem(selectedIndexes, position, position + direction));
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
            <span>Move photos left or right</span>
          </div>
          <div className={styles.orderRail}>
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

              return (
                <div className={styles.orderCard} key={photo.id}>
                  <div className={styles.orderPreview} style={{ aspectRatio: String(targetRatio) }}>
                    {preview(photo)}
                    <span>{position + 1}</span>
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
                  <div className={styles.orderControls}>
                    <button
                      type="button"
                      onClick={() => moveSelected(position, -1)}
                      disabled={disabled || position === 0}
                      aria-label={`Move photo ${photo.index + 1} left`}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSelected(position, 1)}
                      disabled={disabled || position === selectedPhotos.length - 1}
                      aria-label={`Move photo ${photo.index + 1} right`}
                    >
                      →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
