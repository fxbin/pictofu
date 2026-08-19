"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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

const FRAMING_OPTIONS: readonly { id: PhotoRatio; label: string; detail: string }[] = [
  { id: "auto", label: "Fit", detail: "Full photo" },
  { id: "1:1", label: "Square", detail: "1:1" },
  { id: "4:3", label: "Landscape", detail: "4:3" },
  { id: "3:4", label: "Portrait", detail: "3:4" },
];

function photoUrlIn(element: Element | null) {
  const image = element?.querySelector<HTMLImageElement>(".photo-preview img");
  return image?.currentSrc || image?.src || null;
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
    };

    const scheduleSync = () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      scheduled = window.requestAnimationFrame(sync);
    };

    sync();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", scheduleSync, true);
    return () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      observer.disconnect();
      document.removeEventListener("click", scheduleSync, true);
    };
  }, []);

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
        <small>Fit keeps the whole photo · ratios crop only this photo</small>
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
