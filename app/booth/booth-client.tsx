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
import type { BoothPreset } from "@/lib/presets";
import { PRESETS } from "@/lib/presets";
import { TofuMark } from "@/components/brand";

type SupportState = "checking" | "supported" | "unsupported";
type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "countdown"
  | "capturing"
  | "review"
  | "error";
type FacingMode = "user" | "environment";
type LayoutId = BoothPreset["layoutId"];
type FilterId = BoothPreset["filterId"];

type CapturedPhoto = {
  id: string;
  blob: Blob;
  url: string;
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

export function BoothClient({ initialPreset }: { initialPreset: BoothPreset }) {
  const supportState = useSyncExternalStore(
    subscribeToBrowserCapability,
    getCameraSupportSnapshot,
    getServerCameraSupportSnapshot,
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoUrlsRef = useRef<string[]>([]);

  const [presetId, setPresetId] = useState(initialPreset.id);
  const preset = useMemo(
    () => PRESETS.find((item) => item.id === presetId) ?? initialPreset,
    [initialPreset, presetId],
  );
  const [layoutId, setLayoutId] = useState<LayoutId>(initialPreset.layoutId);
  const [filterId, setFilterId] = useState<FilterId>(initialPreset.filterId);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [cameraError, setCameraError] = useState<CameraErrorClass | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const captureBusy = cameraStatus === "requesting" || cameraStatus === "countdown" || cameraStatus === "capturing";
  const canFlip = cameraStatus === "ready" && !captureBusy;

  useEffect(() => {
    const streamHolder = streamRef;
    const urlHolder = photoUrlsRef;

    return () => {
      stopMediaStream(streamHolder.current);
      urlHolder.current.forEach((url) => URL.revokeObjectURL(url));
      urlHolder.current = [];
    };
  }, []);

  function clearCapturedPhotos() {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrlsRef.current = [];
    setCapturedPhotos([]);
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
    clearCapturedPhotos();
    setPresetId(next.id);
    setLayoutId(next.layoutId);
    setFilterId(next.filterId);
    setCameraStatus(streamRef.current ? "ready" : "idle");
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
        video: {
          facingMode: { ideal: nextFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
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
    const nextFacingMode: FacingMode = facingMode === "user" ? "environment" : "user";
    await startCamera(nextFacingMode);
  }

  async function captureFrame(): Promise<CapturedPhoto> {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      throw new Error("Camera frame is not ready");
    }

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
      canvas.toBlob(
        (nextBlob) => (nextBlob ? resolve(nextBlob) : reject(new Error("Camera frame encoding failed"))),
        "image/jpeg",
        0.9,
      );
    });
    const url = URL.createObjectURL(blob);
    photoUrlsRef.current.push(url);

    return {
      id: `${Date.now()}-${crypto.randomUUID()}`,
      blob,
      url,
    };
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

    clearCapturedPhotos();
    emitProductEvent("capture_started", {
      layout_id: layoutId,
      shot_target: preset.shotCount,
    });

    try {
      for (let shotIndex = 0; shotIndex < preset.shotCount; shotIndex += 1) {
        await runCountdown();
        setCameraStatus("capturing");
        const photo = await captureFrame();
        setCapturedPhotos((current) => [...current, photo]);
        emitProductEvent("photo_captured", {
          shot_index: shotIndex + 1,
          shot_target: preset.shotCount,
        });
        if (shotIndex < preset.shotCount - 1) await sleep(420);
      }

      setCameraStatus("review");
      emitProductEvent("capture_completed", {
        shot_count: preset.shotCount,
        layout_id: layoutId,
      });
    } catch {
      setCountdown(null);
      setCameraError("camera_start_failed");
      setCameraStatus("error");
      emitProductEvent("camera_error", { error_class: "capture_failed" });
    }
  }

  function restartCapture() {
    clearCapturedPhotos();
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

    emitProductEvent("start_booth", {
      cta_location: "booth_camera",
      entry_preset: preset.id,
    });
    await startCamera(facingMode);
  }

  const statusCopy = cameraError
    ? cameraErrorMessage(cameraError)
    : cameraStatus === "review"
      ? `${capturedPhotos.length} photos captured. Review them, or retake the set.`
      : cameraStatus === "ready"
        ? `Camera ready. PicTofu will take ${preset.shotCount} photos with a 3-second countdown.`
        : "Enable your camera when you’re ready. Photos stay on this device.";

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
            {cameraStatus === "ready" || cameraStatus === "countdown" || cameraStatus === "capturing"
              ? `Camera · ${facingMode === "user" ? "Front" : "Rear"}`
              : cameraStatus === "review"
                ? "Review"
                : "Camera off"}
            {(cameraStatus === "countdown" || cameraStatus === "capturing") && (
              <span className="shot-progress">{capturedPhotos.length + 1}/{preset.shotCount}</span>
            )}
          </div>

          <div className={`booth-camera-placeholder booth-camera-placeholder--${preset.frameId} camera-surface`}>
            <video
              ref={videoRef}
              className={`booth-video ${facingMode === "user" ? "is-mirrored" : ""}`}
              autoPlay
              muted
              playsInline
              aria-label="Live camera preview"
            />

            {(cameraStatus === "idle" || cameraStatus === "error" || supportState === "unsupported") && (
              <div className="camera-empty-state">
                <span className="camera-empty-state__icon" aria-hidden="true">▣</span>
                <strong>{cameraStatus === "error" ? "Camera needs attention" : "Your camera stays private"}</strong>
                <p>{cameraStatus === "error" ? statusCopy : "PicTofu only asks for camera access after you tap the button below."}</p>
              </div>
            )}

            {cameraStatus === "requesting" && (
              <div className="camera-empty-state"><strong>Starting your camera…</strong><p>Your browser may ask for permission.</p></div>
            )}

            {countdown !== null && <div className="placeholder-countdown camera-countdown">{countdown}</div>}
            {cameraStatus === "capturing" && <div className="capture-flash" aria-hidden="true" />}
          </div>

          <div className="capture-tray">
            <button type="button" aria-label="Photo ratio is 3 by 4" disabled={captureBusy}><span>3:4</span><small>Ratio</small></button>
            <button type="button" aria-label="Countdown is 3 seconds" disabled={captureBusy}><span>3</span><small>Timer</small></button>
            <button
              className="shutter-button"
              type="button"
              onClick={handlePrimaryAction}
              disabled={captureBusy || supportState === "checking"}
              aria-label={primaryActionLabel(cameraStatus, capturedPhotos.length)}
            >
              <span />
            </button>
            <button type="button" aria-label="Flip camera" onClick={flipCamera} disabled={!canFlip}><span>↻</span><small>Flip</small></button>
            <button type="button" aria-label="Flash is not available in this browser experience" disabled><span>ϟ</span><small>Flash</small></button>
          </div>

          <div className={`capture-status ${cameraStatus === "error" ? "is-error" : ""}`} id="capture-status" aria-live="polite">
            <div>
              <strong>{primaryActionLabel(cameraStatus, capturedPhotos.length)}</strong>
              <p>{supportState === "unsupported" ? "Camera access is unavailable in this browser. Try a current Safari or Chrome browser." : statusCopy}</p>
            </div>
            <button type="button" onClick={handlePrimaryAction} disabled={captureBusy || supportState !== "supported"}>
              {primaryActionLabel(cameraStatus, capturedPhotos.length)}
            </button>
          </div>
        </div>

        <aside className="booth-editor-card">
          <div className="preset-select-row">
            <label htmlFor="preset">Template</label>
            <select id="preset" value={presetId} onChange={(event) => selectPreset(event.target.value)} disabled={captureBusy}>
              {PRESETS.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </div>

          <div className="editor-heading">
            <span>{capturedPhotos.length ? "Captured set" : "Current look"}</span>
            <strong>{preset.name}</strong>
          </div>

          <div className={`result-strip result-strip--${preset.frameId}`} aria-label="Photo strip preview">
            {Array.from({ length: preset.shotCount }).map((_, index) => {
              const photo = capturedPhotos[index];
              return (
                <div className={`result-strip__photo result-strip__photo--${filterId} ${photo ? "has-photo" : ""}`} key={photo?.id ?? index}>
                  {photo ? <img src={photo.url} alt={`Captured photo ${index + 1}`} /> : <span aria-hidden="true">{index + 1}</span>}
                </div>
              );
            })}
            <div className="result-strip__brand">✦ PicTofu ♡</div>
          </div>

          {capturedPhotos.length > 0 && (
            <div className="captured-summary" aria-live="polite">
              <strong>{capturedPhotos.length}/{preset.shotCount} captured</strong>
              <span>Stored only in this browser session.</span>
            </div>
          )}

          <div className="editor-control-group">
            <h2>Layouts</h2>
            <div className="choice-grid">
              {LAYOUTS.map((layout) => (
                <button className={layout.id === layoutId ? "is-selected" : ""} type="button" key={layout.id} onClick={() => setLayoutId(layout.id)} disabled={captureBusy}>
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
                <button className={filter.id === filterId ? "is-selected" : ""} type="button" key={filter.id} onClick={() => setFilterId(filter.id)} disabled={captureBusy}>
                  <span className={`filter-dot filter-dot--${filter.id}`} aria-hidden="true" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <button className="download-shell-button" type="button" disabled>
            Download arrives in Issue #3
          </button>
          <p className="editor-footnote">No account. No cloud gallery. Photos stay on your device.</p>
        </aside>
      </section>
    </main>
  );
}
