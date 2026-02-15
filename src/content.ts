import "./content/overlay.css";
import type { ExtensionSettings } from "./types";
import { getSettings, getLastDismissed, setLastDismissed } from "./storage";

console.log("Scroll Break: Content script loaded!");
const TICK_MS = 1000;

function isShortsPage(): boolean {
  return window.location.pathname.startsWith("/shorts/");
}

function getVideo(): HTMLVideoElement | null {
  return document.querySelector("video");
}

function isVideoPlaying(): boolean {
  const video = getVideo();
  return !!(video && !video.paused && !video.ended);
}

function createOverlay(settings: ExtensionSettings, onDismiss: () => void): void {
  if (document.getElementById("scroll-break-overlay-root")) return;

  if (settings.overlayStyle === "pause_and_modal") {
    const video = getVideo();
    if (video) video.pause();
  }

  const root = document.createElement("div");
  root.id = "scroll-break-overlay-root";
  root.innerHTML = `
    <div class="scroll-break-backdrop">
      <div class="scroll-break-modal">
        <h2>Time for a break</h2>
        <p>You've been watching Shorts for a while. Take a short break before continuing.</p>
        <div class="scroll-break-actions">
          <button type="button" class="scroll-break-btn scroll-break-btn-primary" data-action="dismiss">Take a break</button>
        </div>
      </div>
    </div>
  `;

  root.querySelector("[data-action=dismiss]")?.addEventListener("click", () => {
    onDismiss();
    root.remove();
    if (settings.overlayStyle === "pause_and_modal") {
      const video = getVideo();
      if (video) video.play().catch(() => {});
    }
  });

  document.body.appendChild(root);
}

function main(): void {
  console.log("Scroll Break: main() started");
  let accumulatedSeconds = 0;
  let overlayShown = false;
  let settings: ExtensionSettings = {
    limitMinutes: 1,
    cooldownMinutes: 10,
    overlayStyle: "modal",
  };
  let lastDismissed: number | null = null;

  async function loadSettings(): Promise<void> {
    settings = await getSettings();
    lastDismissed = await getLastDismissed();
  }

  function isInCooldown(): boolean {
    if (lastDismissed == null) return false;
    const cooldownMs = settings.cooldownMinutes * 60 * 1000;
    return Date.now() - lastDismissed < cooldownMs;
  }

  async function showOverlay(): Promise<void> {
    overlayShown = true;
    createOverlay(settings, async () => {
      await setLastDismissed(Date.now());
      lastDismissed = Date.now();
      overlayShown = false;
      accumulatedSeconds = 0;
    });
  }

  let lastSettingsLoad = 0;
  const SETTINGS_RELOAD_MS = 30_000;

  setInterval(async () => {
    if (!isShortsPage()) {
      accumulatedSeconds = 0;
      return;
    }
    if (overlayShown) return;

    if (
      lastSettingsLoad === 0 ||
      Date.now() - lastSettingsLoad > SETTINGS_RELOAD_MS
    ) {
      await loadSettings();
      lastSettingsLoad = Date.now();
    }
    if (isInCooldown()) {
      accumulatedSeconds = 0;
      return;
    }

    if (isVideoPlaying()) {
      accumulatedSeconds += TICK_MS / 1000;
      const limitSeconds = settings.limitMinutes * 60;
      if (accumulatedSeconds >= limitSeconds) {
        await showOverlay();
      }
    }
  }, TICK_MS);

  loadSettings();
}

main();
