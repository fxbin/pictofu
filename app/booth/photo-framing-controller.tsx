"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { emitProductEvent } from "@/lib/analytics";
import { cellAspectRatioForLayout } from "@/lib/compositor";
import {
  getPhotoFramingRatio,
  getPhotoFramingServerVersion,
  getPhotoFramingVersion,
  ratioValue,
  setPhotoFramingRatio,
  subscribePhotoFraming,
  type PhotoRatio,
} from "@/lib/photo-framing";
import { PRESETS, type BoothPreset } from "@/lib/presets";

type LayoutId = BoothPreset["layoutId"];

const FRAMING_OPTIONS: readonly { id: PhotoRatio; label: string; detail: string }[] = [
  { id: "auto", label: "Auto", detail: "Layout" },
  { id: "1:1", label: "Square", detail: "1:1" },
  { id: "4:3", label: "Landscape", detail: "4:3" },
  { id: "3:4", label: "Portrait", detail: "3:4" },
];

function layoutForPreset(presetId: string | null | undefined): LayoutId | null {
  return PRESETS.find((preset) => preset.id === presetId)?.layoutId ?? null;
}

function selectedLayoutFromDom(fallback: LayoutId): LayoutId {
  const selected = document.querySelector<HTMLElement>(".choice-grid button.is-selected .layout-icon");
  if (selected?.classList.contains("layout-icon--strip-3")) return "strip-3";
  if (selected?.classList.contains("layout-icon--grid-4")) return "grid-4";
  if (selected?.classList.contains("layout-icon--polaroid")) return "polaroid";
  if (selected?.classList.contains("layout-icon--strip-4")) return "strip-4";

  const presetCard = document.querySelector<HTMLElement>("[data-preset-id].is-selected");
  const presetSelect = document.querySelector<HTMLSelectElement>("#preset");
  return layoutForPreset(presetCard?.dataset.presetId ?? presetSelect?.value) ?? fallback;
}

function photoUrlIn(element: Element | null) {
  const image = element?.querySelector<HTMLImageElement>(".photo-preview img");
  return image?.currentSrc || image?.src || null;
}

function ratioForPhoto(url: string | null, layoutId: LayoutId) {
  const custom = ratioValue(getPhotoFramingRatio(url));
  return custom ?? cellAspectRatioForLayout(layoutId);
}

function applyFramingGeometry(layoutId: LayoutId) {
  const reviewFrame = document.querySelector<HTMLElement>(".review-stage__photo");
  if (reviewFrame) reviewFrame.style.aspectRatio = String(ratioForPhoto(photoUrlIn(reviewFrame), layoutId));

  document.querySelectorAll<HTMLElement>(".result-strip__photo.has-photo").forEach((cell) => {
    cell.style.aspectRatio = String(ratioForPhoto(photoUrlIn(cell), layoutId));
  });
}

export function PhotoFramingController({ initialPresetId }: { initialPresetId: string }) {
  const framingVersion = useSyncExternalStore(subscribePhotoFraming, getPhotoFramingVersion, getPhotoFramingServerVersion);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);
  const [layoutId, setLayoutId] = useState<LayoutId>(() => layoutForPreset(initialPresetId) ?? "strip-4");

  useEffect(() => {
    let scheduled = 0;

    const sync = () => {
      const nextLayout = selectedLayoutFromDom(layoutId);
      if (nextLayout !== layoutId) setLayoutId(nextLayout);

      const stage = document.querySelector<HTMLElement>(".review-stage");
      const activeFrame = stage?.querySelector<HTMLElement>(".review-stage__photo") ?? null;
      setActivePhotoUrl(photoUrlIn(activeFrame));

      if (!stage) {
        setMount(null);
        applyFramingGeometry(nextLayout);
        return;
      }

      let nextMount = stage.querySelector<HTMLElement>(":scope > .photo-framing-mount");
      if (!nextMount) {
        nextMount = document.createElement("div");
        nextMount.className = "photo-framing-mount";
        const transformTools = stage.querySelector(".review-transform-tools");
        stage.insertBefore(nextMount, transformTools);
      }
      setMount(nextMount);
      applyFramingGeometry(nextLayout);
    };

    const scheduleSync = () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      scheduled = window.requestAnimationFrame(sync);
    };

    sync();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", scheduleSync, true);
    document.addEventListener("change", scheduleSync, true);
    window.addEventListener("resize", scheduleSync);
    return () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      observer.disconnect();
      document.removeEventListener("click", scheduleSync, true);
      document.removeEventListener("change", scheduleSync, true);
      window.removeEventListener("resize", scheduleSync);
    };
  }, [layoutId]);

  useEffect(() => {
    applyFramingGeometry(layoutId);
  }, [framingVersion, layoutId]);

  if (!mount || !activePhotoUrl) return null;
  const selected = getPhotoFramingRatio(activePhotoUrl);

  function chooseFraming(ratio: PhotoRatio) {
    if (!activePhotoUrl || selected === ratio) return;
    setPhotoFramingRatio(activePhotoUrl, ratio);
    emitProductEvent("editor_tool_used", { edit_tool: "ratio" });
  }

  return createPortal(
    <section className="photo-framing-control" aria-labelledby="photo-framing-title">
      <div className="photo-framing-control__heading">
        <div>
          <span>Per-photo</span>
          <strong id="photo-framing-title">Framing</strong>
        </div>
        <small>Only this photo changes</small>
      </div>
      <div className="photo-framing-control__options" role="group" aria-label="Choose framing for this photo">
        {FRAMING_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.id}
            className={selected === option.id ? "is-selected" : ""}
            onClick={() => chooseFraming(option.id)}
            aria-pressed={selected === option.id}
          >
            <strong>{option.label}</strong>
            <span>{option.detail}</span>
          </button>
        ))}
      </div>
    </section>,
    mount,
  );
}
