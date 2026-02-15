import type { ExtensionSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const STORAGE_KEYS = {
  SETTINGS: "scrollBreak_settings",
  LAST_DISMISSED: "scrollBreak_lastDismissed",
} as const;

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const stored = result[STORAGE_KEYS.SETTINGS];
  if (stored && typeof stored === "object") {
    return {
      limitMinutes: Number(stored.limitMinutes) || DEFAULT_SETTINGS.limitMinutes,
      cooldownMinutes:
        Number(stored.cooldownMinutes) ?? DEFAULT_SETTINGS.cooldownMinutes,
      overlayStyle:
        stored.overlayStyle === "pause_and_modal"
          ? "pause_and_modal"
          : "modal",
    };
  }
  return { ...DEFAULT_SETTINGS };
}

export async function setSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...settings },
  });
}

export async function getLastDismissed(): Promise<number | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_DISMISSED);
  const t = result[STORAGE_KEYS.LAST_DISMISSED];
  return typeof t === "number" ? t : null;
}

export async function setLastDismissed(timestamp: number): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.LAST_DISMISSED]: timestamp });
}
