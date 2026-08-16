"use client";

import {
  FILTER_STYLES,
  type FilterId,
} from "@/lib/filter-styles";

type FilterPickerProps = {
  selectedId: FilterId;
  thumbnailUrl: string | null;
  disabled?: boolean;
  onSelect: (filterId: FilterId) => void;
};

export function FilterPicker({
  selectedId,
  thumbnailUrl,
  disabled = false,
  onSelect,
}: FilterPickerProps) {
  return (
    <div className="filter-style-picker" aria-label="Choose filter">
      {FILTER_STYLES.map((style) => (
        <button
          className={`filter-style-picker__item ${selectedId === style.id ? "is-selected" : ""}`}
          type="button"
          key={style.id}
          onClick={() => onSelect(style.id)}
          disabled={disabled}
          aria-pressed={selectedId === style.id}
          title={style.description}
        >
          <span
            className="filter-style-picker__thumb"
            style={thumbnailUrl ? undefined : { background: style.swatch }}
            aria-hidden="true"
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                style={{ filter: style.cssFilter }}
              />
            ) : null}
          </span>
          <span className="filter-style-picker__label">{style.label}</span>
        </button>
      ))}
    </div>
  );
}
