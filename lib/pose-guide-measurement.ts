import type { PoseGuideProfile } from "@/lib/pose-guides";

const POSE_GUIDE_PROFILE_KEY = "pictofu:pose_guide_profile";
const PROFILES: ReadonlySet<PoseGuideProfile> = new Set([
  "none",
  "guided",
  "customized",
  "disabled",
]);

export function normalizePoseGuideProfile(value: unknown): PoseGuideProfile {
  return typeof value === "string" && PROFILES.has(value as PoseGuideProfile)
    ? value as PoseGuideProfile
    : "none";
}

export function readPoseGuideProfile(): PoseGuideProfile {
  if (typeof window === "undefined") return "none";
  try {
    return normalizePoseGuideProfile(window.sessionStorage.getItem(POSE_GUIDE_PROFILE_KEY));
  } catch {
    return "none";
  }
}

export function setPoseGuideProfile(profile: PoseGuideProfile) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(POSE_GUIDE_PROFILE_KEY, profile);
  } catch {
    // Pose Guide profile is optional aggregate context and must never block the booth.
  }
}
