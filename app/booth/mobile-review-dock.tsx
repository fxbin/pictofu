"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { emitProductEvent } from "@/lib/analytics";
import {
  getPhotoFramingRatio,
  getPhotoFramingServerVersion,
  getPhotoFramingVersion,
  setPhotoFramingRatio,
  subscribePhotoFraming,
  type PhotoRatio,
} from "@/lib/photo-framing";

type ReviewTool = "crop" | "position" | "zoom" | "rotate" | "straighten" | null;

type ReviewSnapshot = {
  active: boolean;
  photoUrl: string | null;
  zoom: number;
  panX: number;
  panY: number;
  straighten: number;
  canPanX: boolean;
  canPanY: boolean;
  retakeLabel: string;
};

const EMPTY_SNAPSHOT: ReviewSnapshot = {
  active: false,
  photoUrl: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  straighten: 0,
  canPanX: false,
  canPanY: false,
  retakeLabel: "Retake photo",
};

const CROP_OPTIONS: readonly { id: PhotoRatio; label: string }[] = [
  { id: "auto", label: "Fit" },
  { id: "1:1", label: "1:1" },
  { id: "4:3", label: "4:3" },
  { id: "3:4", label: "3:4" },
];

function readNumber(input: HTMLInputElement | null, fallback: number) {
  if (!input) return fallback;
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function rangeByLabel(stage: HTMLElement, labelPrefix: string) {
  return Array.from(stage.querySelectorAll<HTMLLabelElement>(".review-stage__control-grid label"))
    .find((label) => label.querySelector("span")?.textContent?.trim().startsWith(labelPrefix))
    ?.querySelector<HTMLInputElement>('input[type="range"]') ?? null;
}

function clickButton(selector: string) {
  const button = document.querySelector<HTMLButtonElement>(selector);
  if (!button || button.disabled) return;
  button.click();
}

function writeRange(input: HTMLInputElement | null, value: number) {
  if (!input || input.disabled) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, String(value));
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function toolLabel(tool: ReviewTool) {
  if (tool === "crop") return "Crop";
  if (tool === "position") return "Position";
  if (tool === "zoom") return "Zoom";
  if (tool === "rotate") return "Rotate";
  if (tool === "straighten") return "Straighten";
  return "Edit";
}

export function MobileReviewDock() {
  const framingVersion = useSyncExternalStore(subscribePhotoFraming, getPhotoFramingVersion, getPhotoFramingServerVersion);
  const [isMobile, setIsMobile] = useState(false);
  const [tool, setTool] = useState<ReviewTool>(null);
  const [snapshot, setSnapshot] = useState<ReviewSnapshot>(EMPTY_SNAPSHOT);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const syncMedia = () => setIsMobile(media.matches);
    syncMedia();
    media.addEventListener("change", syncMedia);
    return () => media.removeEventListener("change", syncMedia);
  }, []);

  useEffect(() => {
    let scheduled = 0;

    const sync = () => {
      scheduled = 0;
      const page = document.querySelector<HTMLElement>(".booth-page--review");
      const stage = page?.querySelector<HTMLElement>(".review-stage") ?? null;
      const frame = stage?.querySelector<HTMLElement>(".review-stage__photo") ?? null;
      const preview = frame?.querySelector<HTMLElement>(".photo-preview") ?? null;
      const image = preview?.querySelector<HTMLImageElement>("img") ?? null;
      const zoom = stage ? rangeByLabel(stage, "Zoom") : null;
      const horizontal = stage ? rangeByLabel(stage, "Horizontal") : null;
      const vertical = stage ? rangeByLabel(stage, "Vertical") : null;
      const straighten = stage ? rangeByLabel(stage, "Straighten") : null;
      const retake = page?.querySelector<HTMLButtonElement>(".review-workspace__retake-one") ?? null;

      if (stage) stage.dataset.mobileReviewTool = tool ?? "none";

      setSnapshot({
        active: Boolean(page && stage && frame && image),
        photoUrl: image?.currentSrc || image?.src || null,
        zoom: readNumber(zoom, 1),
        panX: readNumber(horizontal, 0),
        panY: readNumber(vertical, 0),
        straighten: readNumber(straighten, 0),
        canPanX: Boolean(horizontal && !horizontal.disabled && preview?.dataset.canPanX !== "false"),
        canPanY: Boolean(vertical && !vertical.disabled && preview?.dataset.canPanY !== "false"),
        retakeLabel: retake?.textContent?.trim() || "Retake photo",
      });
    };

    const scheduleSync = () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      scheduled = window.requestAnimationFrame(sync);
    };

    sync();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "disabled", "data-can-pan-x", "data-can-pan-y"],
    });
    document.addEventListener("input", scheduleSync, true);
    document.addEventListener("change", scheduleSync, true);
    document.addEventListener("click", scheduleSync, true);
    return () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      observer.disconnect();
      document.removeEventListener("input", scheduleSync, true);
      document.removeEventListener("change", scheduleSync, true);
      document.removeEventListener("click", scheduleSync, true);
    };
  }, [tool]);

  useEffect(() => {
    if (snapshot.active) return;
    const frame = window.requestAnimationFrame(() => setTool(null));
    return () => window.cancelAnimationFrame(frame);
  }, [snapshot.active]);

  const selectedCrop = useMemo(
    () => snapshot.photoUrl ? getPhotoFramingRatio(snapshot.photoUrl) : "auto",
    [snapshot.photoUrl, framingVersion],
  );

  function chooseTool(next: Exclude<ReviewTool, null>) {
    setTool((current) => current === next ? null : next);
  }

  function changeRange(labelPrefix: string, value: number) {
    const stage = document.querySelector<HTMLElement>(".booth-page--review .review-stage");
    if (!stage) return;
    writeRange(rangeByLabel(stage, labelPrefix), value);
  }

  function chooseCrop(ratio: PhotoRatio) {
    if (!snapshot.photoUrl || selectedCrop === ratio) return;
    setPhotoFramingRatio(snapshot.photoUrl, ratio);
    emitProductEvent("editor_tool_used", { edit_tool: "ratio" });
  }

  if (!isMobile || !snapshot.active || typeof document === "undefined") return null;

  const panel = tool ? (
    <div className="mobile-review-dock__panel" aria-label={`${toolLabel(tool)} controls`}>
      <div className="mobile-review-dock__panel-heading">
        <strong>{toolLabel(tool)}</strong>
        <button type="button" onClick={() => clickButton(".booth-page--review .review-reset")}>Reset</button>
      </div>

      {tool === "crop" && (
        <div className="mobile-review-dock__crop" role="group" aria-label="Crop ratio">
          {CROP_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.id}
              className={selectedCrop === option.id ? "is-selected" : ""}
              aria-pressed={selectedCrop === option.id}
              onClick={() => chooseCrop(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {tool === "position" && (
        <div className="mobile-review-dock__position">
          <p>Drag the photo directly, or fine-tune its position here.</p>
          <label className={!snapshot.canPanX ? "is-disabled" : ""}>
            <span>Left / right <strong>{Math.round(snapshot.panX * 100)}</strong></span>
            <input type="range" min="-1" max="1" step="0.05" value={snapshot.panX} disabled={!snapshot.canPanX} onChange={(event) => changeRange("Horizontal", Number(event.target.value))} />
          </label>
          <label className={!snapshot.canPanY ? "is-disabled" : ""}>
            <span>Up / down <strong>{Math.round(snapshot.panY * 100)}</strong></span>
            <input type="range" min="-1" max="1" step="0.05" value={snapshot.panY} disabled={!snapshot.canPanY} onChange={(event) => changeRange("Vertical", Number(event.target.value))} />
          </label>
          {(!snapshot.canPanX || !snapshot.canPanY) && <small>Zoom in if you need more room to reposition.</small>}
        </div>
      )}

      {tool === "zoom" && (
        <label className="mobile-review-dock__range">
          <span>Zoom <strong>{snapshot.zoom.toFixed(2)}×</strong></span>
          <input type="range" min="1" max="2.5" step="0.05" value={snapshot.zoom} onChange={(event) => changeRange("Zoom", Number(event.target.value))} />
          <small>Pinch on the photo for a faster adjustment.</small>
        </label>
      )}

      {tool === "rotate" && (
        <div className="mobile-review-dock__rotate" role="group" aria-label="Rotate photo">
          <button type="button" onClick={() => clickButton('.booth-page--review [aria-label="Rotate photo left 90 degrees"]')}><span>↶</span>Rotate left</button>
          <button type="button" onClick={() => clickButton('.booth-page--review [aria-label="Rotate photo right 90 degrees"]')}><span>↷</span>Rotate right</button>
        </div>
      )}

      {tool === "straighten" && (
        <label className="mobile-review-dock__range">
          <span>Straighten <strong>{snapshot.straighten.toFixed(1)}°</strong></span>
          <input type="range" min="-15" max="15" step="0.5" value={snapshot.straighten} onChange={(event) => changeRange("Straighten", Number(event.target.value))} />
        </label>
      )}
    </div>
  ) : null;

  return createPortal(
    <div className="mobile-review-dock" data-active-tool={tool ?? "none"}>
      {panel}

      <div className="mobile-review-dock__tools" role="toolbar" aria-label="Photo editing tools">
        <button type="button" className={tool === "crop" ? "is-selected" : ""} aria-pressed={tool === "crop"} onClick={() => chooseTool("crop")}><span>▣</span><small>Crop</small></button>
        <button type="button" className={tool === "position" ? "is-selected" : ""} aria-pressed={tool === "position"} onClick={() => chooseTool("position")}><span>✥</span><small>Position</small></button>
        <button type="button" className={tool === "zoom" ? "is-selected" : ""} aria-pressed={tool === "zoom"} onClick={() => chooseTool("zoom")}><span>⌕</span><small>Zoom</small></button>
        <button type="button" className={tool === "rotate" ? "is-selected" : ""} aria-pressed={tool === "rotate"} onClick={() => chooseTool("rotate")}><span>↻</span><small>Rotate</small></button>
        <button type="button" onClick={() => clickButton('.booth-page--review [aria-label="Flip photo horizontally"]')}><span>⇋</span><small>Flip</small></button>
        <button type="button" className={tool === "straighten" ? "is-selected" : ""} aria-pressed={tool === "straighten"} onClick={() => chooseTool("straighten")}><span>⟋</span><small>Straighten</small></button>
      </div>

      <div className="mobile-review-dock__actions">
        <button type="button" className="mobile-review-dock__secondary" onClick={() => clickButton(".booth-page--review .review-workspace__retake-one")}>{snapshot.retakeLabel}</button>
        <button type="button" className="mobile-review-dock__primary" onClick={() => clickButton(".booth-page--review .review-workspace__continue")}>Looks good <span aria-hidden="true">→</span></button>
      </div>
    </div>,
    document.body,
  );
}
