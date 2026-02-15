export interface ExtensionSettings {
  limitMinutes: number;
  cooldownMinutes: number;
  overlayStyle: "modal" | "pause_and_modal";
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  limitMinutes: 1,
  cooldownMinutes: 10,
  overlayStyle: "modal",
};
