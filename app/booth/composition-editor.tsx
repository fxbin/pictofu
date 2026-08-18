"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { emitProductEvent } from "@/lib/analytics";
import {
  getEditorCompositionServerSnapshot,
  getEditorCompositionSnapshot,
  ratioValue,
  setCompositionPhotoRatio,
  setCompositionPreset,
  setCompositionStickers,
  subscribeEditorComposition,
  type PhotoRatio,
} from "@/lib/editor-composition";
import {
  getStickerDefinition,
  normalizeStickerInstance,
  stickerPackForPreset,
  type StickerInstance,
} from "@/lib/stickers";

type CompositionEditorProps = {
  presetId: string;
  disabled?: boolean;
};

type StickerDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  startStickerX: number;
  startStickerY: number;
};

const RATIOS: Array<{ id: PhotoRatio; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "1:1", label: "1:1" },
  { id: "4:3", label: "4:3" },
  { id: "3:4", label: "3:4" },
];

function stickerKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CompositionEditor({ presetId, disabled = false }: CompositionEditorProps) {
  const composition = useSyncExternalStore(
    subscribeEditorComposition,
    getEditorCompositionSnapshot,
    getEditorCompositionServerSnapshot,
  );
  const pack = useMemo(() => stickerPackForPreset(presetId), [presetId]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [overlayTarget, setOverlayTarget] = useState<HTMLElement | null>(null);
  const dragRef = useRef<StickerDrag | null>(null);

  useEffect(() => {
    setCompositionPreset(presetId);
    setActiveStickerId(null);
    dragRef.current = null;
  }, [presetId]);

  useEffect(() => {
    setOverlayTarget(document.querySelector<HTMLElement>(".result-strip"));
  }, [presetId]);

  useEffect(() => {
    const root = document.documentElement;
    const ratio = ratioValue(composition.photoRatio);
    if (ratio) {
      root.dataset.pictofuPhotoRatio = composition.photoRatio;
      root.style.setProperty("--pictofu-editor-ratio", String(ratio));
    } else {
      delete root.dataset.pictofuPhotoRatio;
      root.style.removeProperty("--pictofu-editor-ratio");
    }
  }, [composition.photoRatio]);

  const activeSticker = activeStickerId
    ? composition.stickers.find((sticker) => sticker.id === activeStickerId) ?? null
    : null;

  function markTool(tool: "sticker" | "ratio") {
    emitProductEvent("editor_tool_used", { edit_tool: tool, preset_id: presetId });
  }

  function chooseRatio(photoRatio: PhotoRatio) {
    if (disabled || composition.photoRatio === photoRatio) return;
    setCompositionPhotoRatio(photoRatio);
    markTool("ratio");
  }

  function updateSticker(id: string, partial: Partial<StickerInstance>) {
    const next = composition.stickers.map((sticker) => (
      sticker.id === id ? normalizeStickerInstance({ ...sticker, ...partial }) : sticker
    ));
    setCompositionStickers(next);
  }

  function addSticker(stickerId: string) {
    if (disabled) return;
    const offset = composition.stickers.length % 4;
    const next = normalizeStickerInstance({
      id: stickerKey(),
      stickerId,
      x: 0.5 + (offset - 1.5) * 0.08,
      y: 0.24 + offset * 0.12,
      scale: 1,
      rotation: 0,
      zIndex: composition.stickers.length + 1,
    });
    setCompositionStickers([...composition.stickers, next]);
    setActiveStickerId(next.id);
    markTool("sticker");
  }

  function removeSticker(id: string) {
    setCompositionStickers(composition.stickers.filter((sticker) => sticker.id !== id));
    setActiveStickerId((current) => current === id ? null : current);
  }

  function clearStickers() {
    setCompositionStickers([]);
    setActiveStickerId(null);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>, sticker: StickerInstance) {
    if (disabled || !overlayTarget) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveStickerId(sticker.id);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startStickerX: sticker.x,
      startStickerY: sticker.y,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>, stickerId: string) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !overlayTarget) return;
    event.preventDefault();
    const rect = overlayTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    updateSticker(stickerId, {
      x: drag.startStickerX + (event.clientX - drag.startX) / rect.width,
      y: drag.startStickerY + (event.clientY - drag.startY) / rect.height,
    });
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  const overlay = overlayTarget && composition.stickers.length > 0 ? createPortal(
    <div className="sticker-overlay" aria-label="Stickers on photo strip">
      {[...composition.stickers].sort((a, b) => a.zIndex - b.zIndex).map((sticker) => {
        const definition = getStickerDefinition(sticker.stickerId);
        if (!definition) return null;
        const selected = activeStickerId === sticker.id;
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
            onPointerDown={(event) => handlePointerDown(event, sticker)}
            onPointerMove={(event) => handlePointerMove(event, sticker.id)}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
            aria-pressed={selected}
            aria-label={`${definition.label} sticker. Drag to reposition.`}
          >
            {definition.glyph}
          </button>
        );
      })}
    </div>,
    overlayTarget,
  ) : null;

  return (
    <div className="composition-editor">
      {overlay}
      <section className="composition-editor__section" aria-labelledby="photo-ratio-title">
        <div className="composition-editor__heading">
          <div><h3 id="photo-ratio-title">Photo ratio</h3><p>Apply one crop window to every active photo.</p></div>
        </div>
        <div className="ratio-picker">
          {RATIOS.map((ratio) => (
            <button
              type="button"
              key={ratio.id}
              className={composition.photoRatio === ratio.id ? "is-selected" : ""}
              onClick={() => chooseRatio(ratio.id)}
              disabled={disabled}
              aria-pressed={composition.photoRatio === ratio.id}
            >{ratio.label}</button>
          ))}
        </div>
      </section>

      {pack.length > 0 && (
        <section className="composition-editor__section" aria-labelledby="stickers-title">
          <div className="composition-editor__heading">
            <div><h3 id="stickers-title">Stickers</h3><p>Curated for {presetId.replaceAll("-", " ")} · tap to add, then drag on your strip.</p></div>
            {composition.stickers.length > 0 && <button type="button" onClick={clearStickers} disabled={disabled}>Clear</button>}
          </div>
          <div className="sticker-pack">
            {pack.map((sticker) => (
              <button type="button" key={sticker.id} onClick={() => addSticker(sticker.id)} disabled={disabled} aria-label={`Add ${sticker.label} sticker`}>
                <strong style={{ color: sticker.tone }}>{sticker.glyph}</strong>
                <span>{sticker.label}</span>
              </button>
            ))}
          </div>

          {activeSticker && (
            <div className="sticker-editor__active" aria-label="Adjust selected sticker">
              <label>
                <span>Size <strong>{activeSticker.scale.toFixed(2)}×</strong></span>
                <input type="range" min="0.55" max="2" step="0.05" value={activeSticker.scale} onChange={(event) => updateSticker(activeSticker.id, { scale: Number(event.target.value) })} disabled={disabled} />
              </label>
              <label>
                <span>Rotate <strong>{Math.round(activeSticker.rotation)}°</strong></span>
                <input type="range" min="-45" max="45" step="1" value={activeSticker.rotation} onChange={(event) => updateSticker(activeSticker.id, { rotation: Number(event.target.value) })} disabled={disabled} />
              </label>
              <button type="button" className="sticker-editor__delete" onClick={() => removeSticker(activeSticker.id)} disabled={disabled}>Delete sticker</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
