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
import type { BoothPreset } from "@/lib/presets";

type LayoutId = BoothPreset["layoutId"];

const FRAMING_OPTIONS: readonly { id: PhotoRatio; label: string; detail: string }[] = [
  { id: "auto", label: "Auto", detail: "Layout" },
  { id: "1:1", label: "Square", detail: "1:1" },
  { id: "4:3", label: "Landscape", detail: "4:3" },
  { id: "3:4", label: "Portrait", detail: "3:4" },
];

function selectedLayoutFromDom(): LayoutId {
  const selected = document.querySelector<HTMLElement>(".choice-grid button.is-selected .layout-icon");
  if (selected?.classList.contains("layout-icon--strip-3")) return "strip-3";
  if (selected?.classList.contains("layout-icon--grid-4")) return "grid-4";
  if (selected?.classList.contains("layout-icon--polaroid")) return "polaroid";
  return "strip-4";
}

function photoUrlIn(element: Element | null) {
  const image = element?.querySelector<HTMLImageElement>(".photo-preview img");
  return image?.currentSrc || image?.src || null;
}

function ratioForPhoto(url: string | null, layoutId: LayoutId) {
  const custom = ratioValue(getPhotoFramingRatio(url));
  return custom ?? cellAspectRatioForLayout(layoutId);
}

function applyFramingGeometry() {
  const layoutId = selectedLayoutFromDom();
  const reviewFrame = document.querySelector<HTMLElement>(".review-stage__photo");
  if (reviewFrame) reviewFrame.style.aspectRatio = String(ratioForPhoto(photoUrlIn(reviewFrame), layoutId));

  document.querySelectorAll<HTMLElement>(".result-strip__photo.has-photo").forEach((cell) => {
    cell.style.aspectRatio = String(ratioForPhoto(photoUrlIn(cell), layoutId));
  });
}

export function PhotoFramingController() {
  useSyncExternalStore(subscribePhotoFraming, getPhotoFramingVersion, getPhotoFramingServerVersion);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let scheduled = 0;

    const sync = () => {
      const stage = document.querySelector<HTMLElement>(".review-stage");
      const activeFrame = stage?.querySelector<HTMLElement>(".review-stage__photo") ?? null;
      setActivePhotoUrl(photoUrlIn(activeFrame));

      if (!stage) {
        setMount(null);
        applyFramingGeometry();
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
      applyFramingGeometry();
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
  }, []);

  useEffect(() => {
    applyFramingGeometry();
  });

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
