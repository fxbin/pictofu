"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { emitProductEvent } from "@/lib/analytics";
import {
  getPoseGuideSequence,
  poseGuideStepForShot,
} from "@/lib/pose-guides";
import { PoseGuideOverlay } from "./pose-guide-overlay";

type AnalyticsDetail = {
  event_name?: string;
  capture_source?: string;
  shot_index?: number;
  error_class?: string;
};

function selectedPresetFromDom() {
  const selectedCard = document.querySelector<HTMLElement>("[data-preset-id].is-selected");
  if (selectedCard?.dataset.presetId) return selectedCard.dataset.presetId;
  const select = document.querySelector<HTMLSelectElement>("#preset");
  return select?.value || null;
}

function selectedReviewIndex() {
  const active = document.querySelector<HTMLElement>('.review-photo-rail__item[aria-pressed="true"]');
  const label = active?.getAttribute("aria-label") ?? "";
  const match = label.match(/Edit photo (\d+)/i);
  return match ? Math.max(0, Number(match[1]) - 1) : 0;
}

export function PoseGuideController({ initialPresetId }: { initialPresetId: string }) {
  const [surface, setSurface] = useState<HTMLElement | null>(null);
  const [presetId, setPresetId] = useState(initialPresetId);
  const [enabled, setEnabled] = useState(true);
  const [shotIndex, setShotIndex] = useState(0);
  const [poseOffset, setPoseOffset] = useState(0);
  const [cameraLive, setCameraLive] = useState(false);

  const sequence = useMemo(() => getPoseGuideSequence(presetId), [presetId]);
  const pose = sequence ? poseGuideStepForShot(sequence, shotIndex, poseOffset) : null;

  useEffect(() => {
    const syncSurface = () => {
      const next = document.querySelector<HTMLElement>(".camera-surface");
      setSurface((current) => current === next ? current : next);
    };
    syncSurface();
    const observer = new MutationObserver(syncSurface);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let scrollTimer: number | null = null;

    const applyPreset = (nextId: string | null) => {
      if (!nextId || nextId === presetId) return;
      setPresetId(nextId);
      setShotIndex(0);
      setPoseOffset(0);
    };

    const onChange = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement && target.id === "preset") applyPreset(target.value);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const presetCard = target?.closest<HTMLElement>("[data-preset-id]");
      if (presetCard?.dataset.presetId) applyPreset(presetCard.dataset.presetId);

      const retake = target?.closest<HTMLButtonElement>(".review-workspace__retake-one");
      if (retake && /^Retake photo/i.test(retake.textContent ?? "")) {
        setShotIndex(selectedReviewIndex());
        setCameraLive(true);
      }

      if (target?.closest<HTMLButtonElement>(".review-workspace__retake-all")) {
        setShotIndex(0);
        setPoseOffset(0);
        setCameraLive(true);
      }
    };

    const onScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.classList.contains("template-carousel__track")) return;
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => applyPreset(selectedPresetFromDom()), 220);
    };

    document.addEventListener("change", onChange, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      document.removeEventListener("change", onChange, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [presetId]);

  useEffect(() => {
    const onAnalytics = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsDetail>).detail ?? {};
      if (detail.event_name === "camera_permission_granted") {
        setCameraLive(true);
        setShotIndex(0);
      }
      if (detail.event_name === "capture_started" && detail.capture_source === "camera") {
        setCameraLive(true);
        setShotIndex(0);
      }
      if (detail.event_name === "photo_captured" && typeof detail.shot_index === "number") {
        setShotIndex(Math.max(0, detail.shot_index));
      }
      if (detail.event_name === "capture_completed" || detail.event_name === "retake_single") {
        setCameraLive(false);
      }
      if (detail.event_name === "camera_error" && detail.error_class !== "canvas_export_failed") {
        setCameraLive(false);
      }
    };
    window.addEventListener("pictofu:analytics", onAnalytics);
    return () => window.removeEventListener("pictofu:analytics", onAnalytics);
  }, []);

  useEffect(() => {
    if (!cameraLive) return;
    emitProductEvent("pose_guide_changed", {
      preset_id: presetId,
      pose_guide_action: sequence ? "shown" : "unavailable",
      pose_id: pose?.id,
    });
  }, [cameraLive, pose?.id, presetId, sequence]);

  if (!surface || !sequence || !pose || !cameraLive) return null;

  const toggleGuide = () => {
    const next = !enabled;
    setEnabled(next);
    emitProductEvent("pose_guide_changed", {
      preset_id: presetId,
      pose_guide_action: next ? "enabled" : "disabled",
      pose_guide_state: next ? "on" : "off",
      pose_id: pose.id,
    });
  };

  const nextPose = () => {
    const nextOffset = (poseOffset + 1) % sequence.steps.length;
    const next = poseGuideStepForShot(sequence, shotIndex, nextOffset);
    setPoseOffset(nextOffset);
    emitProductEvent("pose_guide_changed", {
      preset_id: presetId,
      pose_guide_action: "next",
      pose_guide_state: enabled ? "on" : "off",
      pose_id: next?.id,
    });
  };

  return createPortal(
    <>
      {enabled && (
        <PoseGuideOverlay
          pose={pose}
          shotIndex={shotIndex}
          shotCount={sequence.steps.length}
          mirrored={document.querySelector(".booth-video")?.classList.contains("is-mirrored") ?? false}
        />
      )}
      <div className="pose-guide-controls" aria-label="Pose Guide controls">
        <button type="button" className={enabled ? "is-enabled" : ""} onClick={toggleGuide} aria-pressed={enabled}>
          <span>✦</span>
          <strong>Pose Guide {enabled ? "On" : "Off"}</strong>
        </button>
        <div className="pose-guide-controls__current" aria-live="polite">
          <span>{Math.min(shotIndex + 1, sequence.steps.length)} / {sequence.steps.length}</span>
          <strong>{pose.title}</strong>
        </div>
        <button type="button" onClick={nextPose} aria-label="Show another pose">
          <span>↻</span>
          <strong>Next pose</strong>
        </button>
      </div>
    </>,
    surface,
  );
}
