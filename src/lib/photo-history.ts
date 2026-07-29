"use client";

export type PhotoHistoryRecord = {
  id: string;
  presetName: string;
  createdAt: string;
  mode: "draft" | "ai-generated";
  image: string;
};

export const PHOTO_HISTORY_KEY = "photo-ready-history-v2";
const PHOTO_HISTORY_EVENT = "photo-ready-history-updated";
const EMPTY_HISTORY: PhotoHistoryRecord[] = [];

let cachedRaw = "";
let cachedHistory: PhotoHistoryRecord[] = EMPTY_HISTORY;

function parsePhotoHistory(raw: string | null) {
  const normalized = raw || "[]";
  if (normalized === cachedRaw) {
    return cachedHistory;
  }

  try {
    const parsed = JSON.parse(normalized);
    cachedRaw = normalized;
    cachedHistory = Array.isArray(parsed) ? parsed : EMPTY_HISTORY;
    return cachedHistory;
  } catch {
    cachedRaw = normalized;
    cachedHistory = EMPTY_HISTORY;
    return cachedHistory;
  }
}

export function readPhotoHistory(): PhotoHistoryRecord[] {
  if (typeof window === "undefined") {
    return EMPTY_HISTORY;
  }

  return parsePhotoHistory(window.localStorage.getItem(PHOTO_HISTORY_KEY));
}

export function writePhotoHistory(record: PhotoHistoryRecord) {
  if (typeof window === "undefined") {
    return;
  }

  const items = [record, ...readPhotoHistory()].slice(0, 10);
  const nextRaw = JSON.stringify(items);
  cachedRaw = nextRaw;
  cachedHistory = items;
  window.localStorage.setItem(PHOTO_HISTORY_KEY, nextRaw);
  window.dispatchEvent(new Event(PHOTO_HISTORY_EVENT));
}

export function subscribePhotoHistory(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === PHOTO_HISTORY_KEY) {
      cachedRaw = "";
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PHOTO_HISTORY_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PHOTO_HISTORY_EVENT, onChange);
  };
}

export function getPhotoHistoryServerSnapshot() {
  return EMPTY_HISTORY;
}
