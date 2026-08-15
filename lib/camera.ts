export type CameraErrorClass =
  | "camera_permission_denied"
  | "camera_unavailable"
  | "camera_start_failed";

export function normalizeCameraError(error: unknown): CameraErrorClass {
  if (!(error instanceof DOMException)) return "camera_start_failed";

  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "camera_permission_denied";
  }

  if (
    error.name === "NotFoundError" ||
    error.name === "OverconstrainedError" ||
    error.name === "NotReadableError"
  ) {
    return "camera_unavailable";
  }

  return "camera_start_failed";
}

export function cameraErrorMessage(errorClass: CameraErrorClass): string {
  switch (errorClass) {
    case "camera_permission_denied":
      return "Camera permission is blocked. Allow camera access in your browser settings, then try again.";
    case "camera_unavailable":
      return "We couldn’t find an available camera. Check that another app is not using it, then try again.";
    default:
      return "The camera could not start. Try again or reopen PicToFu in a current Safari or Chrome browser.";
  }
}

export function boundedCaptureSize(
  sourceWidth: number,
  sourceHeight: number,
  maxEdge = 1440,
): { width: number; height: number } {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return { width: 0, height: 0 };
  }

  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
