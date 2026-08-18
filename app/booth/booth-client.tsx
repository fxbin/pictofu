"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";
import { TofuMark } from "@/components/brand";
import { emitProductEvent } from "@/lib/analytics";
import {
  boundedCaptureSize,
  cameraErrorMessage,
  normalizeCameraError,
  stopMediaStream,
  type CameraErrorClass,
} from "@/lib/camera";
import {
  cellAspectRatioForLayout,
  composePhotoStrip,
  DEFAULT_PHOTO_ADJUSTMENT,
  normalizePhotoAdjustment,
  shotTargetForLayout,
  type PhotoAdjustment,
} from "@/lib/compositor";
import { filterCssValue, getFilterStyle } from "@/lib/filter-styles";
import type { BoothPreset } from "@/lib/presets";
import { PRESETS } from "@/lib/presets";
import { buildMakeYoursUrl } from "@/lib/share-links";
import { FilterPicker } from "./filter-picker";
import { FramePicker } from "./frame-picker";
import { PhotoPreview } from "./photo-preview";
import { PhotoSelectionPicker } from "./photo-selection-picker";

type SupportState = "checking" | "supported" | "unsupported";
type CameraStatus = "idle" | "requesting" | "ready" | "countdown" | "capturing" | "review" | "error";
type ExportStatus = "idle" | "working" | "done" | "error";
type FacingMode = "user" | "environment";
type SavePreviewReason = "download" | "share";
type WorkspaceMode = "capture" | "review" | "style";
type LayoutId = BoothPreset["layoutId"];
type FilterId = BoothPreset["filterId"];
type FrameId = BoothPreset["frameId"];

type CaptureSlot = {
  slotId: string;
  source: "camera" | "upload";
  blob: Blob;
  url: string;
  width: number;
  height: number;
  adjustment: PhotoAdjustment;
};

type AdjustDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  startAdjustment: PhotoAdjustment;
};

const MAX_UPLOAD_FILE_BYTES = 30 * 1024 * 1024;

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
  return navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function" ? "supported" : "unsupported";
}

function getServerCameraSupportSnapshot(): SupportState {
  return "checking";
}

function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function imageUrlSize(url: string) {
  return new Promise<{ width: number; height: number } | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(
      image.naturalWidth && image.naturalHeight
        ? { width: image.naturalWidth, height: image.naturalHeight }
        : null,
    );
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function primaryActionLabel(status: CameraStatus, capturedCount: number) {
  if (status === "requesting") return "Starting…";
  if (status === "countdown" || status === "capturing") return "Capturing…";
  if (status === "ready") return "Take photos";
  if (status === "review" && capturedCount > 0) return "Start over";
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

async function copyText(text: string) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy is unavailable");
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function emptyCaptureSlots(count: number): Array<CaptureSlot | null> {
  return Array.from({ length: count }, () => null);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function photoNoun(count: number) {
  return count === 1 ? "photo" : "photos";
}

function presetPreviewCellCount(preset: BoothPreset) {
  return preset.layoutId === "polaroid" ? 1 : preset.shotCount;
}

export function BoothClient({ initialPreset }: { initialPreset: BoothPreset }) {
  const supportState = useSyncExternalStore(subscribeToBrowserCapability, getCameraSupportSnapshot, getServerCameraSupportSnapshot);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoUrlsRef = useRef<string[]>([]);
  const savePreviewUrlRef = useRef<string | null>(null);
  const editStartedRef = useRef(false);
  const adjustDragRef = useRef<AdjustDrag | null>(null);
  const templateTrackRef = useRef<HTMLDivElement | null>(null);
  const templateScrollTimerRef = useRef<number | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTargetIndexRef = useRef<number | null>(null);

  const [presetId, setPresetId] = useState(initialPreset.id);
  const preset = useMemo(() => PRESETS.find((item) => item.id === presetId) ?? initialPreset, [initialPreset, presetId]);
  const [layoutId, setLayoutId] = useState<LayoutId>(initialPreset.layoutId);
  const [filterId, setFilterId] = useState<FilterId>(initialPreset.filterId);
  const [frameId, setFrameId] = useState<FrameId>(initialPreset.frameId);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("capture");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [cameraError, setCameraError] = useState<CameraErrorClass | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureSlots, setCaptureSlots] = useState<Array<CaptureSlot | null>>([]);
  const [activeRetakeIndex, setActiveRetakeIndex] = useState<number | null>(null);
  const [activeAdjustIndex, setActiveAdjustIndex] = useState<number | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [savePreviewUrl, setSavePreviewUrl] = useState<string | null>(null);
  const [savePreviewReason, setSavePreviewReason] = useState<SavePreviewReason | null>(null);
  const [photoSelections, setPhotoSelections] = useState<Partial<Record<LayoutId, number[]>>>({});

  const captureBusy = cameraStatus === "requesting" || cameraStatus === "countdown" || cameraStatus === "capturing";
  const capturedCount = captureSlots.reduce((total, slot) => total + (slot ? 1 : 0), 0);
  const canFlip = cameraStatus === "ready" && !captureBusy;
  const selectedLayoutTarget = shotTargetForLayout(layoutId);
  const activeCellRatio = cellAspectRatioForLayout(layoutId);
  const availablePhotoIndexes = captureSlots.flatMap((slot, index) => slot ? [index] : []);
  const storedPhotoSelection = photoSelections[layoutId];
  const selectedPhotoIndexes = storedPhotoSelection === undefined
    ? availablePhotoIndexes.slice(0, selectedLayoutTarget)
    : storedPhotoSelection.filter((index) => Boolean(captureSlots[index])).slice(0, selectedLayoutTarget);
  const exportSlots = selectedPhotoIndexes.map((index) => captureSlots[index] ?? null);
  const exportReady = exportSlots.length === selectedLayoutTarget && exportSlots.every((slot) => slot !== null) && !captureBusy && exportStatus !== "working";
  const photoChoices = captureSlots.flatMap((slot, index) => slot ? [{
    index,
    id: slot.slotId,
    url: slot.url,
    width: slot.width,
    height: slot.height,
    adjustment: slot.adjustment,
  }] : []);
  const activeAdjustSlot = activeAdjustIndex === null ? null : captureSlots[activeAdjustIndex] ?? null;
  const activeAdjustment = normalizePhotoAdjustment(activeAdjustSlot?.adjustment);
  const filterThumbnailUrl = captureSlots.find((slot): slot is CaptureSlot => slot !== null)?.url ?? null;
  const selectedLayoutLabel = LAYOUTS.find((layout) => layout.id === layoutId)?.label ?? layoutId;
  const selectedFilterLabel = getFilterStyle(filterId).label;

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
      if (templateScrollTimerRef.current !== null) window.clearTimeout(templateScrollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (workspaceMode === "review" || !window.matchMedia("(max-width: 720px)").matches) return;
    const track = templateTrackRef.current;
    const card = track?.querySelector<HTMLElement>(`[data-preset-id="${presetId}"]`);
    if (!track || !card) return;
    const targetLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    if (Math.abs(track.scrollLeft - targetLeft) < 4) return;
    track.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }, [presetId, workspaceMode]);

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
    setActiveAdjustIndex(null);
    setPhotoSelections({});
    adjustDragRef.current = null;
    setReviewMessage(null);
    setUploadMessage(null);
    setExportStatus("idle");
    setExportMessage(null);
    editStartedRef.current = false;
  }

  function stopCurrentStream() {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function beginEditIfNeeded() {
    if (capturedCount > 0 && !editStartedRef.current) {
      editStartedRef.current = true;
      emitProductEvent("edit_started", { entry_preset: preset.id });
    }
  }

  function selectPreset(nextId: string) {
    if (captureBusy || nextId === presetId) return;
    const next = PRESETS.find((item) => item.id === nextId);
    if (!next) return;

    closeSavePreview();
    if (capturedCount > 0) beginEditIfNeeded();
    setPresetId(next.id);
    setLayoutId(next.layoutId);
    setFilterId(next.filterId);
    setFrameId(next.frameId);
    setActiveRetakeIndex(null);
    adjustDragRef.current = null;
    setExportStatus("idle");
    setExportMessage(null);

    if (capturedCount > 0) {
      const required = shotTargetForLayout(next.layoutId);
      setCameraStatus("review");
      setReviewMessage(
        capturedCount >= required
          ? `${next.name} applied. Your ${capturedCount} ${photoNoun(capturedCount)} and adjustments stayed intact.`
          : `${next.name} needs ${required} photos. Your ${capturedCount} ${photoNoun(capturedCount)} and adjustments are preserved; return to Review or Start over when you want a complete set.`,
      );
      return;
    }

    setCameraStatus(streamRef.current ? "ready" : "idle");
  }

  function handleTemplateCarouselScroll() {
    if (templateScrollTimerRef.current !== null) window.clearTimeout(templateScrollTimerRef.current);
    templateScrollTimerRef.current = window.setTimeout(() => {
      templateScrollTimerRef.current = null;
      const track = templateTrackRef.current;
      if (!track || captureBusy) return;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      track.querySelectorAll<HTMLElement>("[data-preset-id]").forEach((card) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(cardCenter - trackCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = card.dataset.presetId ?? null;
        }
      });

      if (closestId && closestId !== presetId) selectPreset(closestId);
    }, 140);
  }

  function markStyleChange(styleType: "layout" | "filter" | "frame", styleId: string) {
    closeSavePreview();
    beginEditIfNeeded();
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

  function choosePhotoSelection(nextIndexes: number[]) {
    const uniqueIndexes = Array.from(new Set(nextIndexes));
    if (uniqueIndexes.length > selectedLayoutTarget || uniqueIndexes.some((index) => !captureSlots[index])) return;
    if (uniqueIndexes.length === selectedPhotoIndexes.length && uniqueIndexes.every((index, position) => index === selectedPhotoIndexes[position])) return;
    setPhotoSelections((current) => ({ ...current, [layoutId]: uniqueIndexes }));
    closeSavePreview();
    beginEditIfNeeded();
    emitProductEvent("style_changed", {
      style_type: selectedLayoutTarget === 1 ? "source_photo" : "photo_selection",
      style_id: uniqueIndexes.length ? uniqueIndexes.map((index) => `p${index + 1}`).join("-") : "none",
    });
    setExportStatus("idle");
    setExportMessage(null);
  }

  function selectAdjustSlot(slotIndex: number) {
    if (captureBusy || workspaceMode !== "review" || cameraStatus !== "review" || !captureSlots[slotIndex]) return;
    setActiveAdjustIndex(slotIndex);
    setReviewMessage(`Photo ${slotIndex + 1} selected. Drag on the image, then fine-tune position or zoom below.`);
  }

  function updateSlotAdjustment(slotIndex: number, adjustment: PhotoAdjustment) {
    closeSavePreview();
    beginEditIfNeeded();
    setCaptureSlots((current) => current.map((slot, index) => index === slotIndex && slot ? { ...slot, adjustment } : slot));
    setExportStatus("idle");
    setExportMessage(null);
  }

  function updateActiveAdjustment(partial: Partial<PhotoAdjustment>) {
    if (activeAdjustIndex === null || !activeAdjustSlot) return;
    updateSlotAdjustment(activeAdjustIndex, normalizePhotoAdjustment({
      ...activeAdjustSlot.adjustment,
      ...partial,
    }));
  }

  function resetActiveAdjustment() {
    if (activeAdjustIndex === null || !activeAdjustSlot) return;
    updateSlotAdjustment(activeAdjustIndex, { ...DEFAULT_PHOTO_ADJUSTMENT });
    setReviewMessage(`Photo ${activeAdjustIndex + 1} adjustments reset.`);
  }

  function handleAdjustPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (activeAdjustIndex === null || !activeAdjustSlot || captureBusy || workspaceMode !== "review" || cameraStatus !== "review") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    adjustDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startAdjustment: normalizePhotoAdjustment(activeAdjustSlot.adjustment),
    };
  }

  function handleAdjustPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = adjustDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || activeAdjustIndex === null) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const deltaX = ((event.clientX - drag.startX) / rect.width) * 2;
    const deltaY = ((event.clientY - drag.startY) / rect.height) * 2;
    updateSlotAdjustment(activeAdjustIndex, normalizePhotoAdjustment({
      ...drag.startAdjustment,
      panX: clamp(drag.startAdjustment.panX - deltaX, -1, 1),
      panY: clamp(drag.startAdjustment.panY - deltaY, -1, 1),
    }));
  }

  function handleAdjustPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (adjustDragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    adjustDragRef.current = null;
    if (activeAdjustIndex !== null) setReviewMessage(`Photo ${activeAdjustIndex + 1} position updated.`);
  }

  function continueToStyle() {
    if (!capturedCount) return;
    setWorkspaceMode("style");
    setReviewMessage(null);
  }

  function returnToReview() {
    if (!capturedCount) return;
    if (activeAdjustIndex === null || !captureSlots[activeAdjustIndex]) {
      const firstCapturedIndex = captureSlots.findIndex(Boolean);
      setActiveAdjustIndex(firstCapturedIndex >= 0 ? firstCapturedIndex : null);
    }
    setCameraStatus("review");
    setWorkspaceMode("review");
    setReviewMessage("Review your photos. Select any photo to adjust or replace it.");
  }

  async function startCamera(nextFacingMode: FacingMode = facingMode) {
    if (supportState !== "supported") {
      setCameraError("camera_unavailable");
      setCameraStatus("error");
      return;
    }

    setUploadMessage(null);
    setWorkspaceMode("capture");
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

  function openPhotoUpload(slotIndex: number | null = null) {
    if (captureBusy) return;
    uploadTargetIndexRef.current = slotIndex;
    setUploadMessage(null);
    if (slotIndex === null) {
      emitProductEvent("start_booth", { cta_location: "booth_upload", entry_preset: preset.id });
    }
    uploadInputRef.current?.click();
  }

  async function prepareUploadSlot(file: File, slotId: string): Promise<CaptureSlot | null> {
    if (file.size > MAX_UPLOAD_FILE_BYTES) return null;
    if (file.type && !file.type.startsWith("image/")) return null;

    const url = URL.createObjectURL(file);
    const size = await imageUrlSize(url);
    if (!size) {
      URL.revokeObjectURL(url);
      return null;
    }

    return {
      slotId,
      source: "upload",
      blob: file,
      url,
      width: size.width,
      height: size.height,
      adjustment: { ...DEFAULT_PHOTO_ADJUSTMENT },
    };
  }

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    const targetIndex = uploadTargetIndexRef.current;
    uploadTargetIndexRef.current = null;
    if (!selectedFiles.length) return;

    const limit = targetIndex === null ? preset.shotCount : 1;
    const candidates = selectedFiles.slice(0, limit);
    const prepared = (
      await Promise.all(
        candidates.map((file, index) => {
          const slotId = targetIndex === null
            ? `slot-${index + 1}`
            : captureSlots[targetIndex]?.slotId ?? `slot-${targetIndex + 1}`;
          return prepareUploadSlot(file, slotId);
        }),
      )
    ).filter((slot): slot is CaptureSlot => slot !== null);

    if (!prepared.length) {
      setUploadMessage("Choose a photo format this browser can open. Each file must be 30 MB or smaller.");
      return;
    }

    setUploadMessage(null);
    setCameraError(null);
    closeSavePreview();
    setExportStatus("idle");
    setExportMessage(null);

    if (targetIndex !== null) {
      const existingSlot = captureSlots[targetIndex];
      if (!existingSlot) {
        prepared.forEach((slot) => URL.revokeObjectURL(slot.url));
        return;
      }

      const replacement = prepared[0];
      photoUrlsRef.current.push(replacement.url);
      setCaptureSlots((current) => {
        const next = [...current];
        next[targetIndex] = replacement;
        return next;
      });
      setPhotoSelections({});
      window.setTimeout(() => revokePhotoUrl(existingSlot.url), 0);
      setActiveAdjustIndex(targetIndex);
      setCameraStatus("review");
      setWorkspaceMode("review");
      setReviewMessage(`Photo ${targetIndex + 1} replaced from your device. Its adjustments reset; every other photo stayed untouched.`);
      emitProductEvent("retake_single", {
        shot_index: targetIndex + 1,
        shot_count: capturedCount,
        capture_source: "upload",
      });
      return;
    }

    stopCurrentStream();
    clearCaptureSlots();
    prepared.forEach((slot) => photoUrlsRef.current.push(slot.url));
    const nextSlots = emptyCaptureSlots(preset.shotCount);
    prepared.forEach((slot, index) => {
      nextSlots[index] = slot;
    });

    setCaptureSlots(nextSlots);
    setActiveAdjustIndex(0);
    setCameraStatus("review");
    setWorkspaceMode("review");
    const skippedCount = selectedFiles.length - prepared.length;
    setReviewMessage(
      skippedCount > 0
        ? `${prepared.length} ${photoNoun(prepared.length)} added from your device. ${skippedCount} selected ${photoNoun(skippedCount)} could not be used. Adjust each photo before you continue.`
        : `${prepared.length} ${photoNoun(prepared.length)} added from your device. Adjust each photo before you continue.`,
    );
    emitProductEvent("capture_started", {
      layout_id: layoutId,
      shot_target: preset.shotCount,
      capture_source: "upload",
    });
    emitProductEvent("capture_completed", {
      shot_count: prepared.length,
      layout_id: layoutId,
      capture_source: "upload",
    });
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
    return {
      slotId,
      source: "camera",
      blob,
      url,
      width,
      height,
      adjustment: { ...DEFAULT_PHOTO_ADJUSTMENT },
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
    setWorkspaceMode("capture");
    setUploadMessage(null);
    clearCaptureSlots();
    setCaptureSlots(emptyCaptureSlots(preset.shotCount));
    emitProductEvent("capture_started", { layout_id: layoutId, shot_target: preset.shotCount, capture_source: "camera" });
    try {
      const shotIndexes = Array.from({ length: preset.shotCount }, (_, index) => index);
      for (const shotIndex of shotIndexes) {
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
      setActiveAdjustIndex(0);
      setWorkspaceMode("review");
      setReviewMessage("Your photos are ready. Select any photo to adjust it, then continue when everything looks good.");
      emitProductEvent("capture_completed", { shot_count: preset.shotCount, layout_id: layoutId, capture_source: "camera" });
    } catch {
      setCountdown(null);
      setCameraError("camera_start_failed");
      setCameraStatus("error");
      setWorkspaceMode("capture");
      emitProductEvent("camera_error", { error_class: "capture_failed" });
    }
  }

  async function retakeSlot(slotIndex: number) {
    if (cameraStatus !== "review" || workspaceMode !== "review" || captureBusy) return;
    const existingSlot = captureSlots[slotIndex];
    if (!existingSlot || !streamRef.current) {
      setReviewMessage("Camera is not ready for a retake. Use Start over to restart the camera session, or replace this photo from your device.");
      return;
    }

    closeSavePreview();
    setExportStatus("idle");
    setExportMessage(null);
    setCameraError(null);
    setActiveRetakeIndex(slotIndex);
    setActiveAdjustIndex(slotIndex);
    setWorkspaceMode("capture");
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
      emitProductEvent("retake_single", { shot_index: slotIndex + 1, shot_count: preset.shotCount, capture_source: "camera" });
      setReviewMessage(`Photo ${slotIndex + 1} replaced. Its adjustments reset; every other photo stayed untouched.`);
    } catch {
      setReviewMessage(`Photo ${slotIndex + 1} could not be retaken. Your previous shot is still safe.`);
      emitProductEvent("camera_error", { error_class: "retake_failed" });
    } finally {
      setCountdown(null);
      setActiveRetakeIndex(null);
      setCameraStatus("review");
      setWorkspaceMode("review");
    }
  }

  function restartCapture() {
    clearCaptureSlots();
    setCameraError(null);
    setCountdown(null);
    setWorkspaceMode("capture");
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
    if (!exportReady) throw new Error(`Add at least ${selectedLayoutTarget} ${photoNoun(selectedLayoutTarget)} for this layout.`);
    setExportStatus("working");
    setExportMessage(null);
    emitProductEvent("export_started", {
      format: "png",
      layout_id: layoutId,
      preset_id: preset.id,
      filter_id: filterId,
      frame_id: frameId,
    });
    try {
      const readySlots = exportSlots.filter((slot): slot is CaptureSlot => Boolean(slot));
      if (readySlots.length !== selectedLayoutTarget) throw new Error("One or more photos are unavailable.");
      const result = await composePhotoStrip({
        photoUrls: readySlots.map((slot) => slot.url),
        photoAdjustments: readySlots.map((slot) => slot.adjustment),
        layoutId,
        filterId,
        frameId,
      });
      setExportStatus("done");
      emitProductEvent("export_completed", {
        format: "png",
        layout_id: layoutId,
        preset_id: preset.id,
        filter_id: filterId,
        frame_id: frameId,
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
      setExportMessage("Your PicToFu strip was downloaded ✨");
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
      const shareUrl = buildMakeYoursUrl(window.location.origin, preset.id);

      emitProductEvent("share_clicked", {
        share_supported: canShareFile,
        share_action: "native_photo",
        share_preset: preset.id,
        delivery_mode: canShareFile ? "native_share" : "save_preview",
        browser_context: browserContext,
      });

      if (!canShareFile) {
        openSavePreview(result.blob, "share");
        return;
      }

      await navigator.share({
        files: [file],
        title: `${preset.name} — PicToFu`,
        text: `Made with PicToFu ✨\nMake yours: ${shareUrl}`,
      });
      setExportMessage("Share sheet opened — your photo includes a Make yours link ✨");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setExportStatus("done");
        setExportMessage("Share canceled — your photos are still here.");
        return;
      }
      if (exportStatus !== "error") {
        setExportStatus("error");
        setExportMessage("Sharing failed. Try Share photo again or use Download PNG.");
      }
    }
  }

  async function copyMakeYoursLink() {
    try {
      const shareUrl = buildMakeYoursUrl(window.location.origin, preset.id);
      await copyText(shareUrl);
      emitProductEvent("share_clicked", {
        share_supported: typeof navigator.share === "function",
        share_action: "copy_link",
        share_preset: preset.id,
        delivery_mode: "copy_link",
        browser_context: isWeChatBrowser() ? "wechat" : "browser",
      });
      setExportStatus("done");
      setExportMessage("Make yours link copied ✨ Send it anywhere you like.");
    } catch {
      setExportStatus("error");
      setExportMessage("Couldn’t copy the link. Try Share photo instead.");
    }
  }

  const templateControls = (
    <div className="preset-select-row">
      <label htmlFor="preset">Template</label>
      <select id="preset" value={presetId} onChange={(event) => selectPreset(event.target.value)} disabled={captureBusy}>
        {PRESETS.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
      </select>

      <div className="template-carousel" aria-label="Swipe to change template">
        <div className="template-carousel__meta">
          <span>{preset.name}</span>
          <small>Swipe to explore · {PRESETS.findIndex((item) => item.id === presetId) + 1}/{PRESETS.length}</small>
        </div>
        <div className="template-carousel__track" ref={templateTrackRef} onScroll={handleTemplateCarouselScroll}>
          {PRESETS.map((item) => (
            <button
              type="button"
              className={`template-carousel__card ${item.id === presetId ? "is-selected" : ""}`}
              data-preset-id={item.id}
              key={item.id}
              onClick={() => selectPreset(item.id)}
              disabled={captureBusy}
              aria-pressed={item.id === presetId}
            >
              <span className={`template-carousel__preview template-carousel__preview--${item.layoutId} template-carousel__preview--${item.frameId}`} aria-hidden="true">
                {Array.from({ length: presetPreviewCellCount(item) }).map((_, index) => <i key={index} />)}
              </span>
              <span className="template-carousel__copy">
                <strong>{item.name}</strong>
                <small>{item.shotCount} {item.shotCount === 1 ? "shot" : "shots"} · {getFilterStyle(item.filterId).label}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="template-carousel__dots" aria-label="Choose template">
          {PRESETS.map((item) => (
            <button
              type="button"
              className={item.id === presetId ? "is-selected" : ""}
              key={item.id}
              onClick={() => selectPreset(item.id)}
              disabled={captureBusy}
              aria-label={`Choose ${item.name}`}
              aria-pressed={item.id === presetId}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const layoutControls = (
    <div className="editor-control-group">
      <h2>Layouts</h2>
      <div className="choice-grid">
        {LAYOUTS.map((layout) => {
          const unavailable = shotTargetForLayout(layout.id) > preset.shotCount;
          return (
            <button className={layout.id === layoutId ? "is-selected" : ""} type="button" key={layout.id} onClick={() => chooseLayout(layout.id)} disabled={captureBusy || unavailable} title={unavailable ? `This template uses up to ${preset.shotCount} ${photoNoun(preset.shotCount)}` : undefined}>
              <span className={`layout-icon layout-icon--${layout.id}`} aria-hidden="true" />{layout.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const photoSelectionControls = capturedCount > 1 && selectedLayoutTarget <= capturedCount ? (
    <div className="editor-control-group">
      <h2>{selectedLayoutTarget === 1 ? "Photo" : "Photos"}</h2>
      <PhotoSelectionPicker
        photos={photoChoices}
        selectedIndexes={selectedPhotoIndexes}
        targetCount={selectedLayoutTarget}
        targetRatio={activeCellRatio}
        filter={filterCssValue(filterId)}
        disabled={captureBusy}
        onChange={choosePhotoSelection}
      />
    </div>
  ) : null;

  const filterControls = (
    <div className="editor-control-group">
      <h2>Filters</h2>
      <FilterPicker
        selectedId={filterId}
        thumbnailUrl={filterThumbnailUrl}
        disabled={captureBusy}
        onSelect={chooseFilter}
      />
    </div>
  );

  const frameControls = (
    <div className="editor-control-group">
      <h2>Frames</h2>
      <FramePicker
        selectedId={frameId}
        presetId={preset.id}
        layoutId={layoutId}
        filterId={filterId}
        disabled={captureBusy}
        onSelect={chooseFrame}
      />
    </div>
  );

  const exportControls = (
    <div className="export-actions">
      <button className="share-strip-button" type="button" disabled={!exportReady} onClick={shareStrip}>Share photo ✦</button>
      <button className="copy-share-link-button" type="button" disabled={!exportReady} onClick={copyMakeYoursLink}>Copy Make yours link</button>
      <button className="download-shell-button" type="button" disabled={!exportReady} onClick={downloadStrip}>{exportStatus === "working" ? "Creating strip…" : "↓ Download PNG"}</button>
    </div>
  );

  const statusCopy = uploadMessage
    ? uploadMessage
    : cameraError
      ? cameraErrorMessage(cameraError)
      : cameraStatus === "review"
        ? `${capturedCount} ${photoNoun(capturedCount)} ready. Review each photo, then style and share.`
        : cameraStatus === "ready"
          ? `Camera ready. PicToFu will take ${preset.shotCount} ${photoNoun(preset.shotCount)} with a 3-second countdown.`
          : "Enable your camera or upload photos when you’re ready. Photos stay on this device.";

  const progressLabel = activeRetakeIndex !== null
    ? `Retake ${activeRetakeIndex + 1}/${preset.shotCount}`
    : `${Math.min(capturedCount + 1, preset.shotCount)}/${preset.shotCount}`;

  const headerStatus = workspaceMode === "review"
    ? "Edit your photos"
    : workspaceMode === "style"
      ? "Style & export"
      : activeRetakeIndex !== null
        ? `Retaking photo ${activeRetakeIndex + 1}`
        : "✨ Ready when you are!";

  return (
    <main className={`booth-page booth-page--${workspaceMode}`}>
      <header className="booth-header">
        <Link href="/" className="booth-back" aria-label="Back to PicToFu home">←</Link>
        <TofuMark compact />
        <span className="booth-header__status" aria-live="polite">{headerStatus}</span>
        <Link className="booth-close" href="/" aria-label="Close booth">×</Link>
      </header>

      <section className={`booth-workspace booth-workspace--${workspaceMode}`} aria-label="PicToFu booth workspace">
        <div className="booth-camera-card">
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handlePhotoUpload}
          />

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
                <strong>{cameraStatus === "error" ? "Camera needs attention" : "Use camera or your own photos"}</strong>
                <p>{cameraStatus === "error" ? statusCopy : "Take a fresh set with the camera, or choose photos from this device and adjust them before export."}</p>
              </div>
            )}
            {cameraStatus === "requesting" && <div className="camera-empty-state"><strong>Starting your camera…</strong><p>Your browser may ask for permission.</p></div>}
            {countdown !== null && <div className="placeholder-countdown camera-countdown">{countdown}</div>}
            {cameraStatus === "capturing" && <div className="capture-flash" aria-hidden="true" />}
          </div>

          <div className="capture-tray">
            <button type="button" aria-label="Photo adjustments are available after capture" disabled><span>✦</span><small>Edit after</small></button>
            <button type="button" aria-label="Countdown is 3 seconds" disabled={captureBusy}><span>3</span><small>Timer</small></button>
            <button className="shutter-button" type="button" onClick={handlePrimaryAction} disabled={captureBusy || supportState === "checking"} aria-label={primaryActionLabel(cameraStatus, capturedCount)}><span /></button>
            <button type="button" aria-label="Flip camera" onClick={flipCamera} disabled={!canFlip}><span>↻</span><small>Flip</small></button>
            <button type="button" aria-label="Flash is not available in this browser experience" disabled><span>ϟ</span><small>Flash</small></button>
          </div>

          <div className={`capture-status ${cameraStatus === "error" ? "is-error" : ""}`} id="capture-status" aria-live="polite">
            <div>
              <strong>{primaryActionLabel(cameraStatus, capturedCount)}</strong>
              <p>{supportState === "unsupported" && !uploadMessage ? "Camera access is unavailable in this browser. You can still upload photos from this device." : statusCopy}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={handlePrimaryAction} disabled={captureBusy || supportState !== "supported"}>{primaryActionLabel(cameraStatus, capturedCount)}</button>
              <button
                type="button"
                onClick={() => openPhotoUpload()}
                disabled={captureBusy}
                style={{ background: "#fff", color: "#a25569", border: "1px solid #e5cbd2" }}
              >
                Upload photos
              </button>
            </div>
          </div>
        </div>

        <aside className="booth-editor-card">
          {workspaceMode === "review" && capturedCount > 0 ? (
            <section className="review-workspace" aria-labelledby="capture-review-title">
              <div className="review-workspace__top">
                <div>
                  <span>Photo Editor</span>
                  <h1 id="capture-review-title">Frame every photo your way</h1>
                  <p>Choose a photo, drag it to reposition, then use the controls below for precise framing. Every photo keeps its own adjustments.</p>
                </div>
                <button type="button" className="review-workspace__retake-all" onClick={restartCapture} disabled={captureBusy}>Start over</button>
              </div>

              <div className="review-photo-rail" aria-label="Photos to review">
                {captureSlots.map((slot, index) => slot ? (
                  <button
                    type="button"
                    className={`review-photo-rail__item ${activeAdjustIndex === index ? "is-selected" : ""}`}
                    key={slot.slotId}
                    onClick={() => selectAdjustSlot(index)}
                    disabled={captureBusy || cameraStatus !== "review"}
                    aria-label={`Edit photo ${index + 1}`}
                    aria-pressed={activeAdjustIndex === index}
                  >
                    <span className="review-photo-rail__thumb">
                      <PhotoPreview
                        url={slot.url}
                        imageWidth={slot.width}
                        imageHeight={slot.height}
                        adjustment={slot.adjustment}
                        targetRatio={0.75}
                      />
                    </span>
                    <strong>Photo {index + 1}</strong>
                  </button>
                ) : null)}
              </div>

              {activeAdjustSlot && activeAdjustIndex !== null && (
                <div className="review-stage" aria-label={`Adjust photo ${activeAdjustIndex + 1}`}>
                  <div className="review-stage__meta">
                    <strong>Photo {activeAdjustIndex + 1} of {capturedCount}</strong>
                    <span>Drag directly on the photo</span>
                  </div>

                  <div
                    className="capture-review__active-photo review-stage__photo"
                    style={{ aspectRatio: String(activeCellRatio) }}
                    onPointerDown={handleAdjustPointerDown}
                    onPointerMove={handleAdjustPointerMove}
                    onPointerUp={handleAdjustPointerEnd}
                    onPointerCancel={handleAdjustPointerEnd}
                  >
                    <PhotoPreview
                      url={activeAdjustSlot.url}
                      imageWidth={activeAdjustSlot.width}
                      imageHeight={activeAdjustSlot.height}
                      adjustment={activeAdjustSlot.adjustment}
                      targetRatio={activeCellRatio}
                      alt={`Adjust framing for photo ${activeAdjustIndex + 1}`}
                    />
                    <span>Drag to reposition</span>
                  </div>

                  <div className="review-stage__control-grid" aria-label="Fine tune photo framing">
                    <label>
                      <span>Zoom <strong>{activeAdjustment.zoom.toFixed(2)}×</strong></span>
                      <input type="range" min="1" max="2.5" step="0.05" value={activeAdjustment.zoom} onChange={(event) => updateActiveAdjustment({ zoom: Number(event.target.value) })} disabled={captureBusy} />
                    </label>
                    <label>
                      <span>Horizontal <strong>{Math.round(activeAdjustment.panX * 100)}</strong></span>
                      <input type="range" min="-1" max="1" step="0.05" value={activeAdjustment.panX} onChange={(event) => updateActiveAdjustment({ panX: Number(event.target.value) })} disabled={captureBusy} />
                    </label>
                    <label>
                      <span>Vertical <strong>{Math.round(activeAdjustment.panY * 100)}</strong></span>
                      <input type="range" min="-1" max="1" step="0.05" value={activeAdjustment.panY} onChange={(event) => updateActiveAdjustment({ panY: Number(event.target.value) })} disabled={captureBusy} />
                    </label>
                  </div>

                  <div className="review-stage__utility-row">
                    <span>Non-destructive · preview matches the current layout crop</span>
                    <button type="button" className="review-reset" onClick={resetActiveAdjustment} disabled={captureBusy}>Reset photo</button>
                  </div>
                </div>
              )}

              {reviewMessage && <p className="capture-review__message review-workspace__message" aria-live="polite">{reviewMessage}</p>}
              <p className="capture-review__privacy review-workspace__privacy">Adjustments stay local to this browser. Replacing or retaking one photo resets only that photo.</p>

              {activeAdjustIndex !== null && activeAdjustSlot && (
                <div className="review-workspace__sticky-actions">
                  {activeAdjustSlot.source === "upload" ? (
                    <button type="button" className="review-workspace__retake-one" onClick={() => openPhotoUpload(activeAdjustIndex)} disabled={captureBusy || cameraStatus !== "review"}>Replace photo {activeAdjustIndex + 1}</button>
                  ) : (
                    <button type="button" className="review-workspace__retake-one" onClick={() => retakeSlot(activeAdjustIndex)} disabled={captureBusy || cameraStatus !== "review"}>Retake photo {activeAdjustIndex + 1}</button>
                  )}
                  <button type="button" className="review-workspace__continue" onClick={continueToStyle} disabled={captureBusy}>Looks good <span aria-hidden="true">→</span></button>
                </div>
              )}
            </section>
          ) : (
            <>
              {workspaceMode === "style" && capturedCount > 0 && (
                <div className="style-workspace__topbar">
                  <button type="button" onClick={returnToReview}>← Edit photos</button>
                  <div><span>Style & Export</span><strong>Your strip is ready — export now or customize it</strong></div>
                </div>
              )}

              {!(workspaceMode === "style" && capturedCount > 0) && templateControls}

              <div className="editor-heading"><span>{capturedCount ? "Your strip" : "Current look"}</span><strong>{preset.name}</strong></div>

              <div className={`result-strip result-strip--${frameId} result-strip--layout-${layoutId}`} aria-label="Photo strip preview">
                {exportSlots.map((slot, index) => {
                  const sourceIndex = slot ? captureSlots.indexOf(slot) : index;
                  return (
                    <div
                      className={`result-strip__photo ${slot ? "has-photo" : ""}`}
                      key={slot?.slotId ?? `slot-${index + 1}`}
                      style={{ aspectRatio: String(activeCellRatio) }}
                    >
                      {slot ? (
                        <PhotoPreview
                          url={slot.url}
                          imageWidth={slot.width}
                          imageHeight={slot.height}
                          adjustment={slot.adjustment}
                          targetRatio={activeCellRatio}
                          filter={filterCssValue(filterId)}
                          alt={`Photo ${sourceIndex + 1}`}
                        />
                      ) : <span aria-hidden="true">{index + 1}</span>}
                    </div>
                  );
                })}
                <div className="result-strip__brand">✦ PicToFu ♡</div>
              </div>

              {capturedCount > 0 && <div className="captured-summary"><strong>{capturedCount} {photoNoun(capturedCount)} ready</strong><span>Stored only in this browser session.</span></div>}

              {workspaceMode === "style" && capturedCount > 0 ? (
                <section className="style-progressive" aria-label="Style and export options">
                  <div className="style-progressive__primary">
                    <div className="style-progressive__primary-copy">
                      <span>Ready to keep</span>
                      <strong>Share or download this strip</strong>
                      <p>You can export the current result without changing anything else.</p>
                    </div>
                    {exportControls}
                  </div>

                  <details className="style-disclosure">
                    <summary>
                      <span><strong>Customize look</strong><small>{preset.name} · {selectedFilterLabel}</small></span>
                    </summary>
                    <div className="style-disclosure__content">
                      {templateControls}
                      {filterControls}
                      {frameControls}
                    </div>
                  </details>

                  <details className="style-disclosure style-disclosure--more">
                    <summary>
                      <span><strong>More options</strong><small>{selectedLayoutLabel} · choose & arrange photos</small></span>
                    </summary>
                    <div className="style-disclosure__content">
                      {layoutControls}
                      {photoSelectionControls}
                      <button type="button" className="style-disclosure__review-link" onClick={returnToReview}>Adjust individual photos in Photo Editor →</button>
                    </div>
                  </details>
                </section>
              ) : (
                <>
                  {layoutControls}
                  {photoSelectionControls}
                  {filterControls}
                  {frameControls}
                  {exportControls}
                </>
              )}

              {capturedCount > 0 && !exportReady && <p className="export-hint">This look needs more photos than the current set. Your existing photos are still safe.</p>}
              {exportMessage && <p className={`export-message ${exportStatus === "error" ? "is-error" : ""}`} aria-live="polite">{exportMessage}</p>}
              <p className="editor-footnote">Share photo sends your PNG plus a preset-aware Make yours link. Photos still stay local to this browser.</p>
            </>
          )}
        </aside>
      </section>

      {savePreviewUrl && (
        <div className="save-preview-overlay" role="presentation">
          <section className="save-preview-card" role="dialog" aria-modal="true" aria-labelledby="save-preview-title">
            <button className="save-preview-card__close" type="button" onClick={closeSavePreview} aria-label="Close save preview">×</button>
            <p className="save-preview-card__eyebrow">Your PicToFu strip is ready</p>
            <h2 id="save-preview-title">Press and hold the image</h2>
            <p className="save-preview-card__copy">
              {isWeChatBrowser()
                ? "In WeChat, press and hold the image, then choose Save Image / 保存图片 or send it to a friend."
                : savePreviewReason === "share"
                  ? "This browser can’t share image files directly. Press and hold the strip to save or share it from your device."
                  : "Press and hold the strip to save it to your device."}
            </p>
            <div className="save-preview-image-wrap">
              <img className="save-preview-image" src={savePreviewUrl} alt="Generated PicToFu photo strip ready to save" />
            </div>
            <p className="save-preview-card__tip">Tip: the image above is the full generated PNG, not a screenshot preview.</p>
            <button className="save-preview-card__done" type="button" onClick={closeSavePreview}>Done</button>
          </section>
        </div>
      )}
    </main>
  );
}
