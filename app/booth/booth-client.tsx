"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { emitProductEvent } from "@/lib/analytics";
import {
  boundedCaptureSize,
  cameraErrorMessage,
  normalizeCameraError,
  stopMediaStream,
  type CameraErrorClass,
} from "@/lib/camera";
import { composePhotoStrip, shotTargetForLayout } from "@/lib/compositor";
import type { BoothPreset } from "@/lib/presets";
import { PRESETS } from "@/lib/presets";
import { TofuMark } from "@/components/brand";

type SupportState = "checking" | "supported" | "unsupported";
type CameraStatus = "idle" | "requesting" | "ready" | "countdown" | "capturing" | "review" | "error";
type ExportStatus = "idle" | "working" | "done" | "error";
type FacingMode = "user" | "environment";
type SavePreviewReason = "download" | "share";
type LayoutId = BoothPreset["layoutId"];
type FilterId = BoothPreset["filterId"];
type FrameId = BoothPreset["frameId"];

type CaptureSlot = {
  slotId: string;
  source: "camera" | "upload";
  blob: Blob;
  url: string;
  crop?: { x: number; y: number; zoom: number };
  transform?: { rotation: number; mirrorX: boolean };
};

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

const FRAMES: { id: FrameId; label: string }[] = [
  { id: "pink", label: "Blush" },
  { id: "cream", label: "Cream" },
  { id: "lilac", label: "Lilac" },
  { id: "mint", label: "Mint" },
];

function subscribeToBrowserCapability() {
  return () => undefined;
}

function getCameraSupportSnapshot(): SupportState {
  return navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function" ? "supported" : "unsupported";
}

function getServerCameraSupportSnapshot(): SupportState {
  return "checking";
}

function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function primaryActionLabel(status: CameraStatus, capturedCount: number) {
  if (status === "requesting") return "Starting…";
  if (status === "countdown" || status === "capturing") return "Capturing…";
  if (status === "ready") return "Take photos";
  if (status === "review" && capturedCount > 0) return "Retake all";
  if (status === "error") return "Try camera again";
  return "Enable camera";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function emptyCaptureSlots(count: number): Array<CaptureSlot | null> {
  return Array.from({ length: count }, () => null);
}

export function BoothClient({ initialPreset }: { initialPreset: BoothPreset }) {
  const supportState = useSyncExternalStore(subscribeToBrowserCapability, getCameraSupportSnapshot, getServerCameraSupportSnapshot);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoUrlsRef = useRef<string[]>([]);
  const savePreviewUrlRef = useRef<string | null>(null);
  const editStartedRef = useRef(false);

  const [presetId, setPresetId] = useState(initialPreset.id);
  const preset = useMemo(() => PRESETS.find((item) => item.id === presetId) ?? initialPreset, [initialPreset, presetId]);
  const [layoutId, setLayoutId] = useState<LayoutId>(initialPreset.layoutId);
  const [filterId, setFilterId] = useState<FilterId>(initialPreset.filterId);
  const [frameId, setFrameId] = useState<FrameId>(initialPreset.frameId);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [cameraError, setCameraError] = useState<CameraErrorClass | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureSlots, setCaptureSlots] = useState<Array<CaptureSlot | null>>([]);
  const [activeRetakeIndex, setActiveRetakeIndex] = useState<number | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [savePreviewUrl, setSavePreviewUrl] = useState<string | null>(null);
  const [savePreviewReason, setSavePreviewReason] = useState<SavePreviewReason | null>(null);

  const captureBusy = cameraStatus === "requesting" || cameraStatus === "countdown" || cameraStatus === "capturing";
  const capturedCount = captureSlots.reduce((total, slot) => total + (slot ? 1 : 0), 0);
  const canFlip = cameraStatus === "ready" && !captureBusy;
  const selectedLayoutTarget = shotTargetForLayout(layoutId);
  const exportSlots = captureSlots.slice(0, selectedLayoutTarget);
  const exportReady = exportSlots.length === selectedLayoutTarget && exportSlots.every((slot) => slot !== null) && !captureBusy && exportStatus !== "working";

  useEffect(() => {
    const streamHolder = streamRef;
    const urlHolder = photoUrlsRef;
    const saveUrlHolder = savePreviewUrlRef;
    return () => {
      stopMediaStream(streamHolder.current);
      urlHolder.current.forEach((url) => URL.revokeObjectURL(url));
      urlHolder.current = [];
      if (saveUrlHolder.current) URL.revokeObjectURL(saveUrlHolder.current);
      saveUrlHolder.current = null;
    };
  }, []);

  function closeSavePreview() {
    if (savePreviewUrlRef.current) URL.revokeObjectURL(savePreviewUrlRef.current);
    savePreviewUrlRef.current = null;
    setSavePreviewUrl(null);
    setSavePreviewReason(null);
  }

  function openSavePreview(blob: Blob, reason: SavePreviewReason) {
    closeSavePreview();
    const url = URL.createObjectURL(blob);
    savePreviewUrlRef.current = url;
    setSavePreviewUrl(url);
    setSavePreviewReason(reason);
    setExportStatus("done");
    setExportMessage(
      reason === "share"
        ? "This browser can’t share the PNG directly. Press and hold the image to save or send it."
        : "Press and hold the generated image to save it to your device.",
    );
  }

  function revokePhotoUrl(url: string) {
    const index = photoUrlsRef.current.indexOf(url);
    if (index >= 0) photoUrlsRef.current.splice(index, 1);
    URL.revokeObjectURL(url);
  }

  function clearCaptureSlots() {
    closeSavePreview();
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrlsRef.current = [];
    setCaptureSlots([]);
    setActiveRetakeIndex(null);
    setReviewMessage(null);
    setExportStatus("idle");
    setExportMessage(null);
    editStartedRef.current = false;
  }

  function stopCurrentStream() {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function selectPreset(nextId: string) {
    if (captureBusy) return;
    const next = PRESETS.find((item) => item.id === nextId);
    if (!next) return;
    clearCaptureSlots();
    setPresetId(next.id);
    setLayoutId(next.layoutId);
    setFilterId(next.filterId);
    setFrameId(next.frameId);
    setCameraStatus(streamRef.current ? "ready" : "idle");
  }

  function markStyleChange(styleType: "layout" | "filter" | "frame", styleId: string) {
    closeSavePreview();
    if (capturedCount > 0 && !editStartedRef.current) {
      editStartedRef.current = true;
      emitProductEvent("edit_started", { entry_preset: preset.id });
    }
    emitProductEvent("style_changed", { style_type: styleType, style_id: styleId });
    setExportStatus("idle");
    setExportMessage(null);
  }

  function chooseLayout(nextLayout: LayoutId) {
    if (shotTargetForLayout(nextLayout) > preset.shotCount) return;
    setLayoutId(nextLayout);
    markStyleChange("layout", nextLayout);
  }

  function chooseFilter(nextFilter: FilterId) {
    setFilterId(nextFilter);
    markStyleChange("filter", nextFilter);
  }

  function chooseFrame(nextFrame: FrameId) {
    setFrameId(nextFrame);
    markStyleChange("frame", nextFrame);
  }

  async function startCamera(nextFacingMode: FacingMode = facingMode) {
    if (supportState !== "supported") {
      setCameraError("camera_unavailable");
      setCameraStatus("error");
      return;
    }

    setCameraStatus("requesting");
    setCameraError(null);
    emitProductEvent("camera_permission_requested", { facing_mode: nextFacingMode });
    stopCurrentStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: nextFacingMode }, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      const video = videoRef.current;
      if (!video) {
        stopMediaStream(stream);
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setFacingMode(nextFacingMode);
      setCameraStatus("ready");
      emitProductEvent("camera_permission_granted", { facing_mode: nextFacingMode });
    } catch (error) {
      const errorClass = normalizeCameraError(error);
      stopCurrentStream();
      setCameraError(errorClass);
      setCameraStatus("error");
      if (errorClass === "camera_permission_denied") {
        emitProductEvent("camera_permission_denied", { error_class: errorClass });
      } else {
        emitProductEvent("camera_error", { error_class: errorClass });
      }
    }
  }

  async function flipCamera() {
    if (!canFlip) return;
    await startCamera(facingMode === "user" ? "environment" : "user");
  }

  async function captureFrame(slotId: string): Promise<CaptureSlot> {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) throw new Error("Camera frame is not ready");
    const { width, height } = boundedCaptureSize(video.videoWidth, video.videoHeight);
    if (!width || !height) throw new Error("Camera reported an invalid frame size");

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable");
    if (facingMode === "user") {
      context.translate(width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((nextBlob) => (nextBlob ? resolve(nextBlob) : reject(new Error("Camera frame encoding failed"))), "image/jpeg", 0.9);
    });
    const url = URL.createObjectURL(blob);
    photoUrlsRef.current.push(url);
    return { slotId, source: "camera", blob, url };
  }

  async function runCountdown() {
    setCameraStatus("countdown");
    for (const value of [3, 2, 1]) {
      setCountdown(value);
      await sleep(650);
    }
    setCountdown(null);
  }

  async function captureSequence() {
    if (cameraStatus !== "ready") return;
    clearCaptureSlots();
    setCaptureSlots(emptyCaptureSlots(preset.shotCount));
    emitProductEvent("capture_started", { layout_id: layoutId, shot_target: preset.shotCount });
    try {
      for (let shotIndex = 0; shotIndex < preset.shotCount; shotIndex += 1) {
        await runCountdown();
        setCameraStatus("capturing");
        const slot = await captureFrame(`slot-${shotIndex + 1}`);
        setCaptureSlots((current) => {
          const next = current.length === preset.shotCount ? [...current] : emptyCaptureSlots(preset.shotCount);
          next[shotIndex] = slot;
          return next;
        });
        emitProductEvent("photo_captured", { shot_index: shotIndex + 1, shot_target: preset.shotCount });
        if (shotIndex < preset.shotCount - 1) await sleep(420);
      }
      setCameraStatus("review");
      setReviewMessage("Tap any photo to retake only that shot, or keep them all and style your strip.");
      emitProductEvent("capture_completed", { shot_count: preset.shotCount, layout_id: layoutId });
    } catch {
      setCountdown(null);
      setCameraError("camera_start_failed");
      setCameraStatus("error");
      emitProductEvent("camera_error", { error_class: "capture_failed" });
    }
  }

  async function retakeSlot(slotIndex: number) {
    if (cameraStatus !== "review" || captureBusy) return;
    const existingSlot = captureSlots[slotIndex];
    if (!existingSlot || !streamRef.current) {
      setReviewMessage("Camera is not ready for a retake. Try Retake all to restart the session.");
      return;
    }

    closeSavePreview();
    setExportStatus("idle");
    setExportMessage(null);
    setCameraError(null);
    setActiveRetakeIndex(slotIndex);
    setReviewMessage(`Retaking photo ${slotIndex + 1}…`);

    try {
      await runCountdown();
      setCameraStatus("capturing");
      const replacement = await captureFrame(existingSlot.slotId);
      setCaptureSlots((current) => {
        const next = [...current];
        next[slotIndex] = replacement;
        return next;
      });
      window.setTimeout(() => revokePhotoUrl(existingSlot.url), 0);
      emitProductEvent("retake_single", { shot_index: slotIndex + 1, shot_count: preset.shotCount });
      setReviewMessage(`Photo ${slotIndex + 1} replaced. Review the set or continue styling.`);
    } catch {
      setReviewMessage(`Photo ${slotIndex + 1} could not be retaken. Your previous shot is still safe.`);
      emitProductEvent("camera_error", { error_class: "retake_failed" });
    } finally {
      setCountdown(null);
      setActiveRetakeIndex(null);
      setCameraStatus("review");
    }
  }

  function restartCapture() {
    clearCaptureSlots();
    setCameraError(null);
    setCountdown(null);
    setCameraStatus(streamRef.current ? "ready" : "idle");
  }

  async function handlePrimaryAction() {
    if (captureBusy) return;
    if (cameraStatus === "review") {
      restartCapture();
      return;
    }
    if (cameraStatus === "ready") {
      await captureSequence();
      return;
    }
    emitProductEvent("start_booth", { cta_location: "booth_camera", entry_preset: preset.id });
    await startCamera(facingMode);
  }

  async function createStrip() {
    if (!exportReady) throw new Error(`Capture at least ${selectedLayoutTarget} photo${selectedLayoutTarget === 1 ? "" : "s"} for this layout.`);
    setExportStatus("working");
    setExportMessage(null);
    emitProductEvent("export_started", { format: "png", layout_id: layoutId });
    try {
      const photoUrls = exportSlots.map((slot) => slot?.url).filter((url): url is string => Boolean(url));
      const result = await composePhotoStrip({
        photoUrls,
        layoutId,
        filterId,
        frameId,
      });
      setExportStatus("done");
      emitProductEvent("export_completed", {
        format: "png",
        layout_id: layoutId,
        output_width: result.width,
        output_height: result.height,
      });
      return result;
    } catch (error) {
      setExportStatus("error");
      setExportMessage(error instanceof Error ? error.message : "Photo strip export failed. Try again.");
      emitProductEvent("camera_error", { error_class: "canvas_export_failed" });
      throw error;
    }
  }

  async function downloadStrip() {
    try {
      const result = await createStrip();
      if (isWeChatBrowser()) {
        openSavePreview(result.blob, "download");
        emitProductEvent("download_clicked", {
          layout_id: layoutId,
          delivery_mode: "save_preview",
          browser_context: "wechat",
        });
        return;
      }
      downloadBlob(result.blob, `pictofu-${preset.id}.png`);
      emitProductEvent("download_clicked", {
        layout_id: layoutId,
        delivery_mode: "direct_download",
        browser_context: "browser",
      });
      setExportMessage("Your PicTofu strip was downloaded ✨");
    } catch {
      // createStrip owns the user-visible failure state.
    }
  }

  async function shareStrip() {
    try {
      const result = await createStrip();
      const file = new File([result.blob], `pictofu-${preset.id}.png`, { type: "image/png" });
      const canShareFile = typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [file] }));
      const browserContext = isWeChatBrowser() ? "wechat" : "browser";

      emitProductEvent("share_clicked", {
        share_supported: canShareFile,
        delivery_mode: canShareFile ? "native_share" : "save_preview",
        browser_context: browserContext,
      });

      if (!canShareFile) {
        openSavePreview(result.blob, "share");
        return;
      }

      await navigator.share({ files: [file], title: "My PicTofu photo strip", text: "Made with PicTofu ✨" });
      setExportMessage("Share sheet opened for your PicTofu strip ✨");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setExportStatus("done");
        setExportMessage("Share canceled — your photos are still here.");
        return;
      }
      if (exportStatus !== "error") {
        setExportStatus("error");
        setExportMessage("Sharing failed. Try Share again or use Download PNG.");
      }
    }
  }

  const statusCopy = cameraError
    ? cameraErrorMessage(cameraError)
    : cameraStatus === "review"
      ? `${capturedCount} photos captured. Retake only the shots you want to improve, then style and share.`
      : cameraStatus === "ready"
        ? `Camera ready. PicTofu will take ${preset.shotCount} photos with a 3-second countdown.`
        : "Enable your camera when you’re ready. Photos stay on this device.";

  const progressLabel = activeRetakeIndex !== null
    ? `Retake ${activeRetakeIndex + 1}/${preset.shotCount}`
    : `${Math.min(capturedCount + 1, preset.shotCount)}/${preset.shotCount}`;

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
            <span className={`live-dot ${cameraStatus === "ready" ? "is-live" : ""}`} aria-hidden="true" />
            {cameraStatus === "ready" || cameraStatus === "countdown" || cameraStatus === "capturing" ? `Camera · ${facingMode === "user" ? "Front" : "Rear"}` : cameraStatus === "review" ? "Review" : "Camera off"}
            {(cameraStatus === "countdown" || cameraStatus === "capturing") && <span className="shot-progress">{progressLabel}</span>}
          </div>

          <div className={`booth-camera-placeholder booth-camera-placeholder--${frameId} camera-surface`}>
            <video ref={videoRef} className={`booth-video ${facingMode === "user" ? "is-mirrored" : ""}`} autoPlay muted playsInline aria-label="Live camera preview" />
            {(cameraStatus === "idle" || cameraStatus === "error" || supportState === "unsupported") && (
              <div className="camera-empty-state">
                <span className="camera-empty-state__icon" aria-hidden="true">▣</span>
                <strong>{cameraStatus === "error" ? "Camera needs attention" : "Your camera stays private"}</strong>
                <p>{cameraStatus === "error" ? statusCopy : "PicTofu only asks for camera access after you tap the button below."}</p>
              </div>
            )}
            {cameraStatus === "requesting" && <div className="camera-empty-state"><strong>Starting your camera…</strong><p>Your browser may ask for permission.</p></div>}
            {countdown !== null && <div className="placeholder-countdown camera-countdown">{countdown}</div>}
            {cameraStatus === "capturing" && <div className="capture-flash" aria-hidden="true" />}
          </div>

          <div className="capture-tray">
            <button type="button" aria-label="Photo ratio is 3 by 4" disabled={captureBusy}><span>3:4</span><small>Ratio</small></button>
            <button type="button" aria-label="Countdown is 3 seconds" disabled={captureBusy}><span>3</span><small>Timer</small></button>
            <button className="shutter-button" type="button" onClick={handlePrimaryAction} disabled={captureBusy || supportState === "checking"} aria-label={primaryActionLabel(cameraStatus, capturedCount)}><span /></button>
            <button type="button" aria-label="Flip camera" onClick={flipCamera} disabled={!canFlip}><span>↻</span><small>Flip</small></button>
            <button type="button" aria-label="Flash is not available in this browser experience" disabled><span>ϟ</span><small>Flash</small></button>
          </div>

          <div className={`capture-status ${cameraStatus === "error" ? "is-error" : ""}`} id="capture-status" aria-live="polite">
            <div><strong>{primaryActionLabel(cameraStatus, capturedCount)}</strong><p>{supportState === "unsupported" ? "Camera access is unavailable in this browser. Try a current Safari or Chrome browser." : statusCopy}</p></div>
            <button type="button" onClick={handlePrimaryAction} disabled={captureBusy || supportState !== "supported"}>{primaryActionLabel(cameraStatus, capturedCount)}</button>
          </div>
        </div>

        <aside className="booth-editor-card">
          <div className="preset-select-row">
            <label htmlFor="preset">Template</label>
            <select id="preset" value={presetId} onChange={(event) => selectPreset(event.target.value)} disabled={captureBusy}>
              {PRESETS.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </div>

          <div className="editor-heading"><span>{capturedCount ? "Your strip" : "Current look"}</span><strong>{preset.name}</strong></div>

          <div className={`result-strip result-strip--${frameId} result-strip--layout-${layoutId}`} aria-label="Photo strip preview">
            {Array.from({ length: Math.min(preset.shotCount, selectedLayoutTarget) }).map((_, index) => {
              const slot = captureSlots[index];
              return (
                <div className={`result-strip__photo result-strip__photo--${filterId} ${slot ? "has-photo" : ""}`} key={slot?.slotId ?? `slot-${index + 1}`}>
                  {slot ? <img src={slot.url} alt={`Captured photo ${index + 1}`} /> : <span aria-hidden="true">{index + 1}</span>}
                </div>
              );
            })}
            <div className="result-strip__brand">✦ PicTofu ♡</div>
          </div>

          {capturedCount > 0 && (
            <section className="capture-review" aria-labelledby="capture-review-title">
              <div className="capture-review__heading">
                <div>
                  <span>Review</span>
                  <h2 id="capture-review-title">Keep the good ones</h2>
                </div>
                <button type="button" className="capture-review__retake-all" onClick={restartCapture} disabled={captureBusy}>Retake all</button>
              </div>
              <div className="capture-review__grid">
                {captureSlots.map((slot, index) => slot ? (
                  <button
                    type="button"
                    className={`capture-review__shot ${activeRetakeIndex === index ? "is-active" : ""}`}
                    key={slot.slotId}
                    onClick={() => retakeSlot(index)}
                    disabled={captureBusy || cameraStatus !== "review"}
                    aria-label={`Retake photo ${index + 1}`}
                  >
                    <span className="capture-review__thumb"><img src={slot.url} alt={`Review photo ${index + 1}`} /></span>
                    <span className="capture-review__shot-label"><strong>Photo {index + 1}</strong><span>{activeRetakeIndex === index ? "Retaking…" : "Retake"}</span></span>
                  </button>
                ) : null)}
              </div>
              {reviewMessage && <p className="capture-review__message" aria-live="polite">{reviewMessage}</p>}
              <p className="capture-review__privacy">Only the selected slot is replaced. The other photos stay untouched on this device.</p>
            </section>
          )}

          {capturedCount > 0 && <div className="captured-summary"><strong>{capturedCount} captured</strong><span>Stored only in this browser session.</span></div>}

          <div className="editor-control-group">
            <h2>Layouts</h2>
            <div className="choice-grid">
              {LAYOUTS.map((layout) => {
                const unavailable = shotTargetForLayout(layout.id) > preset.shotCount;
                return (
                  <button className={layout.id === layoutId ? "is-selected" : ""} type="button" key={layout.id} onClick={() => chooseLayout(layout.id)} disabled={captureBusy || unavailable} title={unavailable ? `This template captures ${preset.shotCount} photos` : undefined}>
                    <span className={`layout-icon layout-icon--${layout.id}`} aria-hidden="true" />{layout.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="editor-control-group">
            <h2>Filters</h2>
            <div className="filter-choice-row">
              {FILTERS.map((filter) => <button className={filter.id === filterId ? "is-selected" : ""} type="button" key={filter.id} onClick={() => chooseFilter(filter.id)} disabled={captureBusy}><span className={`filter-dot filter-dot--${filter.id}`} aria-hidden="true" />{filter.label}</button>)}
            </div>
          </div>

          <div className="editor-control-group">
            <h2>Frames</h2>
            <div className="frame-choice-row">
              {FRAMES.map((frame) => <button className={`frame-choice frame-choice--${frame.id} ${frame.id === frameId ? "is-selected" : ""}`} type="button" key={frame.id} onClick={() => chooseFrame(frame.id)} disabled={captureBusy}><span aria-hidden="true" />{frame.label}</button>)}
            </div>
          </div>

          <div className="export-actions">
            <button className="download-shell-button" type="button" disabled={!exportReady} onClick={downloadStrip}>{exportStatus === "working" ? "Creating strip…" : "↓ Download PNG"}</button>
            <button className="share-strip-button" type="button" disabled={!exportReady} onClick={shareStrip}>Share ✦</button>
          </div>
          {capturedCount > 0 && !exportReady && <p className="export-hint">Choose a layout that fits the captured set.</p>}
          {exportMessage && <p className={`export-message ${exportStatus === "error" ? "is-error" : ""}`} aria-live="polite">{exportMessage}</p>}
          <p className="editor-footnote">PNG is composed locally. No account. No cloud gallery.</p>
        </aside>
      </section>

      {savePreviewUrl && (
        <div className="save-preview-overlay" role="presentation">
          <section className="save-preview-card" role="dialog" aria-modal="true" aria-labelledby="save-preview-title">
            <button className="save-preview-card__close" type="button" onClick={closeSavePreview} aria-label="Close save preview">×</button>
            <p className="save-preview-card__eyebrow">Your PicTofu strip is ready</p>
            <h2 id="save-preview-title">Press and hold the image</h2>
            <p className="save-preview-card__copy">
              {isWeChatBrowser()
                ? "In WeChat, press and hold the image, then choose Save Image / 保存图片 or send it to a friend."
                : savePreviewReason === "share"
                  ? "This browser can’t share image files directly. Press and hold the strip to save or share it from your device."
                  : "Press and hold the strip to save it to your device."}
            </p>
            <div className="save-preview-image-wrap">
              <img className="save-preview-image" src={savePreviewUrl} alt="Generated PicTofu photo strip ready to save" />
            </div>
            <p className="save-preview-card__tip">Tip: the image above is the full generated PNG, not a screenshot preview.</p>
            <button className="save-preview-card__done" type="button" onClick={closeSavePreview}>Done</button>
          </section>
        </div>
      )}
    </main>
  );
}
