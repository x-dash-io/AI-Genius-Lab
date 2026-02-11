export type UiEffectsMode = "solid" | "glass";

export interface UiPreferences {
  effectsMode: UiEffectsMode;
  reducedMotion: boolean;
}

export const UI_EFFECTS_STORAGE_KEY = "ui-effects-mode";
