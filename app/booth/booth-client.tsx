"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { emitProductEvent } from "@/lib/analytics";
import type { BoothPreset } from "@/lib/presets";
import { PRESETS } from "@/lib/presets";
import { TofuMark } from "@/components/brand";

type SupportState = "checking" | "supported" | "unsupported";
type LayoutId = BoothPreset["layoutId"];
type FilterId = BoothPreset["filterId"];

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "bw", label: "B&W" },
  { id: "warm", label: "Warm" },
  { id: "vintage", label: "Vintage" },
  { id: "y2k", label: "Y2K" },
];

const LAYOUTS: { id: LayoutId; label: string }[] = [
  { id: "strip-4", label: "1×4" },
  { id: "strip-3", label: "1×3" },
  { id: "grid-4", label: "2×2" },
  { id: "polaroid", label: "Polaroid" },
];

function subscribeToBrowserCapability() {
  return () => undefined;
}

function getCameraSupportSnapshot(): SupportState {
  return navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function"
    ? "supported"
    : "unsupported";
}

function getServerCameraSupportSnapshot(): SupportState {
  return "checking";
}

export function BoothClient({ initialPreset }: { initialPreset: BoothPreset }) {
  const supportState = useSyncExternalStore(
    subscribeToBrowserCapability,
    getCameraSupportSnapshot,
    getServerCameraSupportSnapshot,
  );
  const [presetId, setPresetId] = useState(initialPreset.id);
  const preset = useMemo(
    () => PRESETS.find((item) => item.id === presetId) ?? initialPreset,
    [initialPreset, presetId],
  );
  const [layoutId, setLayoutId] = useState<LayoutId>(initialPreset.layoutId);
  const [filterId, setFilterId] = useState<FilterId>(initialPreset.filterId);

  function selectPreset(nextId: string) {
    const next = PRESETS.find((item) => item.id === nextId);
    if (!next) return;
    setPresetId(next.id);
    setLayoutId(next.layoutId);
    setFilterId(next.filterId);
  }

  function handleCameraIntent() {
    emitProductEvent("start_booth", {
      cta_location: "booth_shell",
      entry_preset: preset.id,
    });

    const captureSection = document.getElementById("capture-status");
    captureSection?.focus();
  }

  return (
    <main className="booth-page">
      <header className="booth-header">
        <Link href="/" className="booth-back" aria-label="Back to PicTofu home">←</Link>
        <TofuMark compact />
        <span className="booth-header__status">✨ Ready when you are!</span>
        <Link className="booth-close" href="/" aria-label="Close booth">×</Link>
      </header>

      <section className="booth-workspace" aria-label="PicTofu booth workspace">
        <div className="booth-camera-card">
          <div className="booth-camera-card__status">
            <span className="live-dot" aria-hidden="true" />
            Preview mode
          </div>
          <div className={`booth-camera-placeholder booth-camera-placeholder--${preset.frameId}`}>
            <div className="placeholder-person" aria-hidden="true">
              <span className="placeholder-person__hair" />
              <span className="placeholder-person__face">◕‿◕</span>
              <span className="placeholder-person__hand">✌</span>
            </div>
            <div className="placeholder-countdown" aria-hidden="true">3</div>
            <span className="placeholder-doodle placeholder-doodle--one" aria-hidden="true">♡</span>
            <span className="placeholder-doodle placeholder-doodle--two" aria-hidden="true">✦</span>
          </div>

          <div className="capture-tray">
            <button type="button" aria-label="Change photo ratio"><span>3:4</span><small>Ratio</small></button>
            <button type="button" aria-label="Set countdown timer"><span>◷</span><small>Timer</small></button>
            <button className="shutter-button" type="button" onClick={handleCameraIntent} aria-label="Check camera readiness">
              <span />
            </button>
            <button type="button" aria-label="Flip camera"><span>↻</span><small>Flip</small></button>
            <button type="button" aria-label="Toggle flash"><span>ϟ</span><small>Flash</small></button>
          </div>

          <div className="capture-status" id="capture-status" tabIndex={-1}>
            {supportState === "checking" && <p>Checking camera support…</p>}
            {supportState === "supported" && (
              <>
                <strong>Camera-ready browser detected.</strong>
                <p>The next delivery slice connects permission, countdown and real capture. Your photos will stay on this device.</p>
              </>
            )}
            {supportState === "unsupported" && (
              <>
                <strong>Camera access is not available in this browser.</strong>
                <p>Try a current Safari or Chrome browser. An upload fallback is planned after the core capture flow.</p>
              </>
            )}
          </div>
        </div>

        <aside className="booth-editor-card">
          <div className="preset-select-row">
            <label htmlFor="preset">Template</label>
            <select id="preset" value={presetId} onChange={(event) => selectPreset(event.target.value)}>
              {PRESETS.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </div>

          <div className="editor-heading">
            <span>Current look</span>
            <strong>{preset.name}</strong>
          </div>

          <div className={`result-strip result-strip--${preset.frameId}`} aria-label="Photo strip preview">
            {Array.from({ length: preset.shotCount }).map((_, index) => (
              <div className={`result-strip__photo result-strip__photo--${filterId}`} key={index}>
                <span aria-hidden="true">◕‿◕</span>
              </div>
            ))}
            <div className="result-strip__brand">✦ PicTofu ♡</div>
          </div>

          <div className="editor-control-group">
            <h2>Layouts</h2>
            <div className="choice-grid">
              {LAYOUTS.map((layout) => (
                <button
                  className={layout.id === layoutId ? "is-selected" : ""}
                  type="button"
                  key={layout.id}
                  onClick={() => setLayoutId(layout.id)}
                >
                  <span className={`layout-icon layout-icon--${layout.id}`} aria-hidden="true" />
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-control-group">
            <h2>Filters</h2>
            <div className="filter-choice-row">
              {FILTERS.map((filter) => (
                <button
                  className={filter.id === filterId ? "is-selected" : ""}
                  type="button"
                  key={filter.id}
                  onClick={() => setFilterId(filter.id)}
                >
                  <span className={`filter-dot filter-dot--${filter.id}`} aria-hidden="true" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <button className="download-shell-button" type="button" disabled>
            Download unlocks after capture
          </button>
          <p className="editor-footnote">No account. No cloud gallery. Photos stay on your device.</p>
        </aside>
      </section>
    </main>
  );
}
