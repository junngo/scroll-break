import { getSettings, setSettings } from "../storage";
import type { ExtensionSettings } from "../types";

const limitEl = document.getElementById("limit") as HTMLInputElement;
const cooldownEl = document.getElementById("cooldown") as HTMLInputElement;
const styleEl = document.getElementById("style") as HTMLSelectElement;
const saveBtn = document.getElementById("save") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;

function showStatus(message: string, isError = false): void {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
  if (message) {
    setTimeout(() => {
      statusEl.textContent = "";
    }, 3000);
  }
}

async function load(): Promise<void> {
  const s = await getSettings();
  limitEl.value = String(s.limitMinutes);
  cooldownEl.value = String(s.cooldownMinutes);
  styleEl.value = s.overlayStyle;
}

async function save(): Promise<void> {
  const limitMinutes = Math.max(1, Math.min(120, Number(limitEl.value) || 5));
  const cooldownMinutes = Math.max(
    1,
    Math.min(120, Number(cooldownEl.value) || 10)
  );
  const overlayStyle = styleEl.value as ExtensionSettings["overlayStyle"];
  await setSettings({
    limitMinutes,
    cooldownMinutes,
    overlayStyle,
  });
  limitEl.value = String(limitMinutes);
  cooldownEl.value = String(cooldownMinutes);
  showStatus("Settings saved.");
}

saveBtn.addEventListener("click", () => {
  save().catch(() => showStatus("Failed to save.", true));
});

load();
