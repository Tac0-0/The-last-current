export const STORAGE_KEY = "the-last-current-progress";
const empty = () => ({ version: 1, unlockedChapters: [], mute: false });
export function sanitizeProgress(value) {
  if (!value || value.version !== 1) return empty();
  return {
    version: 1,
    unlockedChapters: [
      ...new Set(
        Array.isArray(value.unlockedChapters)
          ? value.unlockedChapters.filter((n) => [1, 2, 3].includes(n))
          : [],
      ),
    ].sort(),
    mute: value.mute === true,
  };
}
export function loadProgress(storage) {
  try {
    return sanitizeProgress(
      JSON.parse((storage ?? globalThis.localStorage).getItem(STORAGE_KEY)),
    );
  } catch {
    return empty();
  }
}
export function saveProgress(progress, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(sanitizeProgress(progress)),
    );
    return true;
  } catch {
    return false;
  }
}
