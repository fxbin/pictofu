"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  getStickerDefinition,
  normalizeStickerInstance,
  stickerPackForPreset,
  type StickerInstance,
} from "@/lib/stickers";

type StickerEditorProps = {
  presetId: string;
  targetId: string;
  disabled?: boolean;
  onChange: (stickers: StickerInstance[]) => void;
};

type StickerDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  startStickerX: number;
  startStickerY: number;
};

function stickerKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StickerEditor({ presetId, targetId, disabled, onChange }: StickerEditorProps) {
  const pack = useMemo(() => stickerPackForPreset(presetId), [presetId]);
  const [stickers, setStickers] = useState<StickerInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const dragRef = useRef<StickerDrag | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById(targetId));
  }, [targetId]);

  useEffect(() => {
    setStickers([]);
    setActiveId(null);
    dragRef.current = null;
  }, [presetId]);

  useEffect(() => {
    onChange(stickers);
  }, [stickers, onChange]);

  if (pack.length === 0) return null;

  const activeSticker = activeId ? stickers.find((sticker) => sticker.id === activeId) ?? null : null;

  function updateSticker(id: string, partial: Partial<StickerInstance>) {
    setStickers((current) => current.map((sticker) => (
      sticker.id === id
        ? normalizeStickerInstance({ ...sticker, ...partial })
        : sticker
    )));
  }

  function addSticker(stickerId: string) {
    if (disabled) return;
    const offset = stickers.length % 4;
    const next = normalizeStickerInstance({
      id: stickerKey(),
      stickerId,
      x: 0.5 + (offset - 1.5) * 0.07,
      y: 0.28 + offset * 0.08,
      scale: 1,
      rotation: 0,
      zIndex: stickers.length + 1,
    });
    setStickers((current) => [...current, next]);
    setActiveId(next.id);
  }

  function removeSticker(id: string) {
    setStickers((current) => current.filter((sticker) => sticker.id !== id));
    setActiveId((current) => current === id ? null : current);
  }

  function clearStickers() {
    setStickers([]);
    setActiveId(null);
    dragRef.current = null;
  }

  function handleStickerPointerDown(event: ReactPointerEvent<HTMLButtonElement>, sticker: StickerInstance) {
    if (disabled || !portalTarget) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveId(sticker.id);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startStickerX: sticker.x,
      startStickerY: sticker.y,
    };
  }

  function handleStickerPointerMove(event: ReactPointerEvent<HTMLButtonElement>, stickerId: string) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !portalTarget) return;
    event.preventDefault();
    const rect = portalTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    updateSticker(stickerId, {
      x: drag.startStickerX + (event.clientX - drag.startX) / rect.width,
      y: drag.startStickerY + (event.clientY - drag.startY) / rect.height,
    });
  }

  function handleStickerPointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  const overlay = portalTarget ? createPortal(
    <div className="sticker-overlay" aria-label="Stickers on photo strip">
      {[...stickers].sort((a, b) => a.zIndex - b.zIndex).map((sticker) => {
        const definition = getStickerDefinition(sticker.stickerId);
        if (!definition) return null;
        const selected = sticker.id === activeId;
        return (
          <button
            type="button"
            key={sticker.id}
            className={`sticker-overlay__item ${selected ? "is-selected" : ""}`}
            style={{
              left: `${sticker.x * 100}%`,
              top: `${sticker.y * 100}%`,
              color: definition.tone,
              fontWeight: definition.weight === "bold" ? 900 : 700,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
              zIndex: 10 + sticker.zIndex,
            }}
            onPointerDown={(event) => handleStickerPointerDown(event, sticker)}
            onPointerMove={(event) => handleStickerPointerMove(event, sticker.id)}
            onPointerUp={handleStickerPointerEnd}
            onPointerCancel={handleStickerPointerEnd}
            aria-pressed={selected}
            aria-label={`${definition.label} sticker. Drag to reposition.`}
          >
            {definition.glyph}
          </button>
        );
      })}
    </div>,
    portalTarget,
  ) : null;

  return (
    <>
      {overlay}
      <div className="editor-control-group sticker-editor" aria-label="Sticker editor">
        <div className="sticker-editor__heading">
          <div>
            <h2>Stickers</h2>
            <p>Curated for this template · tap to add, then drag it on your strip.</p>
          </div>
          {stickers.length > 0 && (
            <button type="button" onClick={clearStickers} disabled={disabled}>Clear stickers</button>
          )}
        </div>

        <div className="sticker-pack" aria-label="Choose a sticker">
          {pack.map((sticker) => (
            <button
              type="button"
              key={sticker.id}
              onClick={() => addSticker(sticker.id)}
              disabled={disabled}
              title={sticker.label}
              aria-label={`Add ${sticker.label} sticker`}
            >
              <strong style={{ color: sticker.tone }}>{sticker.glyph}</strong>
              <span>{sticker.label}</span>
            </button>
          ))}
        </div>

        {activeSticker && (
          <div className="sticker-editor__active" aria-label="Adjust selected sticker">
            <label>
              <span>Size <strong>{activeSticker.scale.toFixed(2)}×</strong></span>
              <input
                type="range"
                min="0.55"
                max="2"
                step="0.05"
                value={activeSticker.scale}
                onChange={(event) => updateSticker(activeSticker.id, { scale: Number(event.target.value) })}
                disabled={disabled}
              />
            </label>
            <label>
              <span>Rotate <strong>{Math.round(activeSticker.rotation)}°</strong></span>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={activeSticker.rotation}
                onChange={(event) => updateSticker(activeSticker.id, { rotation: Number(event.target.value) })}
                disabled={disabled}
              />
            </label>
            <button type="button" className="sticker-editor__delete" onClick={() => removeSticker(activeSticker.id)} disabled={disabled}>Delete sticker</button>
          </div>
        )}
      </div>
    </>
  );
}
