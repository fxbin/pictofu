"use client";

import { emitProductEvent } from "@/lib/analytics";
import { FRAME_STYLES, type FrameCategory, type FrameId } from "@/lib/frame-styles";

const FRAME_GROUPS: readonly {
  id: FrameCategory;
  label: string;
  description: string;
}[] = [
  { id: "basic", label: "Basic", description: "Clean and classic" },
  { id: "cute", label: "Cute", description: "Playful and sweet" },
  { id: "retro", label: "Retro", description: "Nostalgic and stylish" },
] as const;

type FramePickerProps = {
  selectedId: FrameId;
  presetId: string;
  layoutId: string;
  filterId: string;
  disabled?: boolean;
  onSelect: (id: FrameId) => void;
};

export function FramePicker({
  selectedId,
  presetId,
  layoutId,
  filterId,
  disabled = false,
  onSelect,
}: FramePickerProps) {
  const selected = FRAME_STYLES.find((frame) => frame.id === selectedId) ?? FRAME_STYLES[0];

  function selectFrame(frameId: FrameId) {
    if (disabled || frameId === selectedId) return;
    const frame = FRAME_STYLES.find((item) => item.id === frameId);
    if (!frame) return;

    emitProductEvent("frame_selected", {
      frame_id: frame.id,
      frame_group: frame.category,
      preset_id: presetId,
      layout_id: layoutId,
      filter_id: filterId,
    });
    onSelect(frame.id);
  }

  return (
    <div className="frame-picker">
      <div className="frame-picker__selected" aria-live="polite">
        <span>Selected frame</span>
        <strong>{selected.label}</strong>
      </div>

      <div className="frame-picker__groups">
        {FRAME_GROUPS.map((group) => {
          const frames = FRAME_STYLES.filter((frame) => frame.category === group.id);
          return (
            <section className="frame-picker__group" key={group.id} aria-labelledby={`frame-group-${group.id}`}>
              <div className="frame-picker__group-heading">
                <h3 id={`frame-group-${group.id}`}>{group.label}</h3>
                <p>{group.description}</p>
              </div>
              <div className={`frame-choice-row frame-choice-row--${group.id}`}>
                {frames.map((frame) => {
                  const selectedFrame = frame.id === selectedId;
                  return (
                    <button
                      className={`frame-choice frame-choice--${frame.id} ${selectedFrame ? "is-selected" : ""}`}
                      type="button"
                      key={frame.id}
                      onClick={() => selectFrame(frame.id)}
                      disabled={disabled}
                      aria-pressed={selectedFrame}
                      aria-label={`${frame.label}${selectedFrame ? ", selected" : ""}`}
                    >
                      <span className="frame-choice__preview" aria-hidden="true">
                        <i />
                        <b>✓</b>
                      </span>
                      <span className="frame-choice__label">{frame.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
