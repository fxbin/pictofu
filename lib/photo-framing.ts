export type PhotoRatio = "auto" | "1:1" | "4:3" | "3:4";

const framingByPhoto = new Map<string, PhotoRatio>();
const listeners = new Set<() => void>();
let version = 0;

function publish() {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function getPhotoFramingVersion() {
  return version;
}

export function getPhotoFramingServerVersion() {
  return 0;
}

export function subscribePhotoFraming(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPhotoFramingRatio(photoUrl: string | null | undefined): PhotoRatio {
  if (!photoUrl) return "auto";
  return framingByPhoto.get(photoUrl) ?? "auto";
}

export function setPhotoFramingRatio(photoUrl: string, ratio: PhotoRatio) {
  const current = getPhotoFramingRatio(photoUrl);
  if (current === ratio) return;
  if (ratio === "auto") framingByPhoto.delete(photoUrl);
  else framingByPhoto.set(photoUrl, ratio);
  publish();
}

export function clearPhotoFramingRatio(photoUrl: string) {
  if (!framingByPhoto.delete(photoUrl)) return;
  publish();
}

export function ratioValue(photoRatio: PhotoRatio) {
  if (photoRatio === "1:1") return 1;
  if (photoRatio === "4:3") return 4 / 3;
  if (photoRatio === "3:4") return 3 / 4;
  return null;
}
