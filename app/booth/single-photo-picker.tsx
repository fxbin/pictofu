import type { CSSProperties } from "react";
import type { PhotoCrop } from "@/lib/compositor";
import styles from "./single-photo-picker.module.css";

type PhotoChoice = {
  index: number;
  id: string;
  url: string;
  crop?: PhotoCrop;
};

type SinglePhotoPickerProps = {
  photos: PhotoChoice[];
  selectedIndex: number;
  filter: string;
  disabled?: boolean;
  onSelect: (index: number) => void;
};

function previewStyle(crop?: PhotoCrop, filter?: string): CSSProperties {
  const next = crop ?? { x: 0, y: 0, zoom: 1 };
  return {
    objectPosition: `${50 + next.x * 50}% ${50 + next.y * 50}%`,
    transform: `scale(${next.zoom})`,
    filter,
  };
}

export function SinglePhotoPicker({ photos, selectedIndex, filter, disabled, onSelect }: SinglePhotoPickerProps) {
  if (photos.length <= 1) return null;

  return (
    <div className={styles.picker} aria-label="Choose the photo used by this one-photo layout">
      <div className={styles.heading}>
        <strong>Choose your photo</strong>
        <span>Photo {selectedIndex + 1} will be used</span>
      </div>
      <div className={styles.rail}>
        {photos.map((photo) => {
          const selected = photo.index === selectedIndex;
          return (
            <button
              className={`${styles.choice} ${selected ? styles.choiceSelected : ""}`}
              type="button"
              key={photo.id}
              onClick={() => onSelect(photo.index)}
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`Use photo ${photo.index + 1}${selected ? ", selected" : ""}`}
            >
              <img src={photo.url} alt="" style={previewStyle(photo.crop, filter)} />
              <span>{photo.index + 1}</span>
              <b aria-hidden="true">✓</b>
            </button>
          );
        })}
      </div>
    </div>
  );
}
