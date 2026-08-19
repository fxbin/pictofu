"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type StyleTool = "template" | "filter" | "frame" | "layout" | "photos" | null;

type TemplateOption = {
  key: string;
  sourceIndex: number;
  label: string;
  detail: string;
  selected: boolean;
  disabled: boolean;
  previewClass: string;
};

type FilterOption = {
  key: string;
  sourceIndex: number;
  label: string;
  selected: boolean;
  disabled: boolean;
  background: string;
  imageSrc: string | null;
  imageFilter: string;
};

type FrameOption = {
  key: string;
  sourceIndex: number;
  label: string;
  selected: boolean;
  disabled: boolean;
  modifierClass: string;
};

type StyleSnapshot = {
  active: boolean;
  templates: TemplateOption[];
  filters: FilterOption[];
  frames: FrameOption[];
};

const EMPTY_SNAPSHOT: StyleSnapshot = {
  active: false,
  templates: [],
  filters: [],
  frames: [],
};

function text(element: Element | null) {
  return element?.textContent?.trim() ?? "";
}

function readTemplates(page: HTMLElement): TemplateOption[] {
  return Array.from(page.querySelectorAll<HTMLButtonElement>(".style-disclosure .template-carousel__card"))
    .map((button, sourceIndex) => ({
      key: button.dataset.presetId || `template-${sourceIndex}`,
      sourceIndex,
      label: text(button.querySelector(".template-carousel__copy strong")) || `Template ${sourceIndex + 1}`,
      detail: text(button.querySelector(".template-carousel__copy small")),
      selected: button.classList.contains("is-selected") || button.getAttribute("aria-pressed") === "true",
      disabled: button.disabled,
      previewClass: button.querySelector<HTMLElement>(".template-carousel__preview")?.className || "template-carousel__preview",
    }));
}

function readFilters(page: HTMLElement): FilterOption[] {
  return Array.from(page.querySelectorAll<HTMLButtonElement>(".style-disclosure .filter-style-picker__item"))
    .map((button, sourceIndex) => {
      const thumb = button.querySelector<HTMLElement>(".filter-style-picker__thumb");
      const image = thumb?.querySelector<HTMLImageElement>("img") ?? null;
      return {
        key: `filter-${sourceIndex}`,
        sourceIndex,
        label: text(button.querySelector(".filter-style-picker__label")) || `Filter ${sourceIndex + 1}`,
        selected: button.classList.contains("is-selected") || button.getAttribute("aria-pressed") === "true",
        disabled: button.disabled,
        background: thumb ? window.getComputedStyle(thumb).background : "linear-gradient(145deg, #d7b4ab, #f6ded4)",
        imageSrc: image?.currentSrc || image?.src || null,
        imageFilter: image ? window.getComputedStyle(image).filter : "none",
      };
    });
}

function readFrames(page: HTMLElement): FrameOption[] {
  return Array.from(page.querySelectorAll<HTMLButtonElement>(".style-disclosure .frame-choice"))
    .map((button, sourceIndex) => ({
      key: `frame-${sourceIndex}`,
      sourceIndex,
      label: text(button.querySelector(".frame-choice__label")) || `Frame ${sourceIndex + 1}`,
      selected: button.classList.contains("is-selected") || button.getAttribute("aria-pressed") === "true",
      disabled: button.disabled,
      modifierClass: Array.from(button.classList).find((name) => name.startsWith("frame-choice--")) || "frame-choice--white",
    }));
}

function clickSource(selector: string, index: number) {
  const buttons = document.querySelectorAll<HTMLButtonElement>(`.booth-page--style ${selector}`);
  const button = buttons[index];
  if (!button || button.disabled) return;
  button.click();
}

function structuralPanel() {
  return document.querySelector<HTMLDetailsElement>(".booth-page--style .style-disclosure--more");
}

function syncStructuralPanel(tool: StyleTool, active: boolean) {
  const details = structuralPanel();
  if (!details) return;

  if (active && (tool === "layout" || tool === "photos")) {
    details.open = true;
    details.dataset.mobileStyleTool = tool;
    return;
  }

  details.open = false;
  delete details.dataset.mobileStyleTool;
}

function toolLabel(tool: StyleTool) {
  if (tool === "template") return "Template";
  if (tool === "filter") return "Filter";
  if (tool === "frame") return "Frame";
  if (tool === "layout") return "Layout";
  if (tool === "photos") return "Photos";
  return "Style";
}

export function MobileStyleDock() {
  const [isMobile, setIsMobile] = useState(false);
  const [tool, setTool] = useState<StyleTool>(null);
  const [snapshot, setSnapshot] = useState<StyleSnapshot>(EMPTY_SNAPSHOT);
  const snapshotSignatureRef = useRef("");

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
      const page = document.querySelector<HTMLElement>(".booth-page--style");
      const result = page?.querySelector<HTMLElement>(".result-strip") ?? null;
      const next: StyleSnapshot = page && result
        ? {
            active: true,
            templates: readTemplates(page),
            filters: readFilters(page),
            frames: readFrames(page),
          }
        : EMPTY_SNAPSHOT;
      const signature = JSON.stringify(next);
      if (signature !== snapshotSignatureRef.current) {
        snapshotSignatureRef.current = signature;
        setSnapshot(next);
      }
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
      attributeFilter: ["class", "disabled", "aria-pressed"],
    });
    document.addEventListener("click", scheduleSync, true);
    return () => {
      if (scheduled) window.cancelAnimationFrame(scheduled);
      observer.disconnect();
      document.removeEventListener("click", scheduleSync, true);
    };
  }, []);

  useEffect(() => {
    if (!snapshot.active) setTool(null);
  }, [snapshot.active]);

  useEffect(() => {
    syncStructuralPanel(tool, isMobile && snapshot.active);
  }, [isMobile, snapshot.active, tool]);

  useEffect(() => () => syncStructuralPanel(null, false), []);

  function chooseTool(next: Exclude<StyleTool, null>) {
    setTool((current) => current === next ? null : next);
  }

  if (!isMobile || !snapshot.active || typeof document === "undefined") return null;

  const proxyTool = tool === "template" || tool === "filter" || tool === "frame" ? tool : null;
  const panel = proxyTool ? (
    <div className="mobile-style-dock__panel" aria-label={`${toolLabel(proxyTool)} options`}>
      <div className="mobile-style-dock__panel-heading">
        <strong>{toolLabel(proxyTool)}</strong>
        <span>Tap to preview instantly</span>
      </div>

      {proxyTool === "template" && (
        <div className="mobile-style-dock__rail mobile-style-dock__rail--template" role="listbox" aria-label="Choose template">
          {snapshot.templates.map((option) => (
            <button
              type="button"
              key={option.key}
              className={option.selected ? "is-selected" : ""}
              disabled={option.disabled}
              aria-selected={option.selected}
              onClick={() => clickSource(".style-disclosure .template-carousel__card", option.sourceIndex)}
            >
              <span className={option.previewClass} aria-hidden="true">
                {Array.from({ length: option.previewClass.includes("polaroid") ? 1 : option.previewClass.includes("strip-3") ? 3 : 4 }).map((_, index) => <i key={index} />)}
              </span>
              <span className="mobile-style-dock__option-copy"><strong>{option.label}</strong><small>{option.detail}</small></span>
            </button>
          ))}
        </div>
      )}

      {proxyTool === "filter" && (
        <div className="mobile-style-dock__rail mobile-style-dock__rail--filter" role="listbox" aria-label="Choose filter">
          {snapshot.filters.map((option) => (
            <button
              type="button"
              key={option.key}
              className={option.selected ? "is-selected" : ""}
              disabled={option.disabled}
              aria-selected={option.selected}
              onClick={() => clickSource(".style-disclosure .filter-style-picker__item", option.sourceIndex)}
            >
              <span className="mobile-style-dock__filter-thumb" style={{ background: option.background }} aria-hidden="true">
                {option.imageSrc && <img src={option.imageSrc} alt="" style={{ filter: option.imageFilter }} />}
              </span>
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>
      )}

      {proxyTool === "frame" && (
        <div className="mobile-style-dock__rail mobile-style-dock__rail--frame" role="listbox" aria-label="Choose frame">
          {snapshot.frames.map((option) => (
            <button
              type="button"
              key={option.key}
              className={`${option.modifierClass} ${option.selected ? "is-selected" : ""}`}
              disabled={option.disabled}
              aria-selected={option.selected}
              onClick={() => clickSource(".style-disclosure .frame-choice", option.sourceIndex)}
            >
              <span className="frame-choice__preview" aria-hidden="true"><i /></span>
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return createPortal(
    <div className="mobile-style-dock" data-active-tool={tool ?? "none"}>
      {panel}
      <div className="mobile-style-dock__tools" role="toolbar" aria-label="Style tools">
        <button type="button" className={tool === "template" ? "is-selected" : ""} aria-pressed={tool === "template"} onClick={() => chooseTool("template")}><span>▦</span><small>Template</small></button>
        <button type="button" className={tool === "filter" ? "is-selected" : ""} aria-pressed={tool === "filter"} onClick={() => chooseTool("filter")}><span>◐</span><small>Filter</small></button>
        <button type="button" className={tool === "frame" ? "is-selected" : ""} aria-pressed={tool === "frame"} onClick={() => chooseTool("frame")}><span>▣</span><small>Frame</small></button>
        <button type="button" className={tool === "layout" ? "is-selected" : ""} aria-pressed={tool === "layout"} onClick={() => chooseTool("layout")}><span>⊞</span><small>Layout</small></button>
        <button type="button" className={tool === "photos" ? "is-selected" : ""} aria-pressed={tool === "photos"} onClick={() => chooseTool("photos")}><span>▧</span><small>Photos</small></button>
      </div>
    </div>,
    document.body,
  );
}
