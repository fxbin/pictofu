export function deriveSelectedPhotoIndexes<T>(
  slots: readonly (T | null)[],
  storedSelection: readonly number[] | undefined,
  targetCount: number,
): number[] {
  if (targetCount <= 0) return [];

  const availableIndexes = slots.flatMap((slot, index) => (slot ? [index] : []));
  if (storedSelection === undefined) return availableIndexes.slice(0, targetCount);

  const selected: number[] = [];
  const seen = new Set<number>();
  for (const index of storedSelection) {
    if (!Number.isInteger(index) || index < 0 || index >= slots.length) continue;
    if (!slots[index] || seen.has(index)) continue;
    seen.add(index);
    selected.push(index);
    if (selected.length === targetCount) break;
  }

  return selected;
}

export function normalizePhotoSelection<T>(
  slots: readonly (T | null)[],
  candidateIndexes: readonly number[],
  targetCount: number,
): number[] | null {
  if (targetCount < 1) return null;

  const uniqueIndexes = Array.from(new Set(candidateIndexes));
  if (uniqueIndexes.length > targetCount) return null;
  if (uniqueIndexes.some((index) => !Number.isInteger(index) || index < 0 || index >= slots.length || !slots[index])) {
    return null;
  }

  return uniqueIndexes;
}

export function replaceCaptureSlot<T>(
  slots: readonly (T | null)[],
  slotIndex: number,
  replacement: T,
): Array<T | null> {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= slots.length) {
    throw new RangeError(`Capture slot index ${slotIndex} is out of bounds.`);
  }

  const next = [...slots];
  next[slotIndex] = replacement;
  return next;
}
