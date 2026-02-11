"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  UI_EFFECTS_STORAGE_KEY,
  type UiEffectsMode,
  type UiPreferences,
} from "@/lib/ui-preferences";

interface UiPreferencesContextValue extends UiPreferences {
  setEffectsMode: (mode: UiEffectsMode) => void;
  toggleEffectsMode: () => void;
}

const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null);

function readStoredEffectsMode(): UiEffectsMode {
  if (typeof window === "undefined") {
    return "solid";
  }

  const raw = window.localStorage.getItem(UI_EFFECTS_STORAGE_KEY);
  return raw === "glass" ? "glass" : "solid";
}

function applyDocumentEffectsMode(mode: UiEffectsMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.uiEffects = mode;
}

function readReducedMotionPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [effectsMode, setEffectsModeState] = useState<UiEffectsMode>(() => readStoredEffectsMode());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => readReducedMotionPreference());

  useEffect(() => {
    applyDocumentEffectsMode(effectsMode);
  }, [effectsMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      document.documentElement.dataset.reducedMotion = event.matches ? "true" : "false";
    };

    document.documentElement.dataset.reducedMotion = reducedMotion ? "true" : "false";

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [reducedMotion]);

  const setEffectsMode = useCallback((mode: UiEffectsMode) => {
    setEffectsModeState(mode);
    applyDocumentEffectsMode(mode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(UI_EFFECTS_STORAGE_KEY, mode);
    }
  }, []);

  const toggleEffectsMode = useCallback(() => {
    setEffectsMode(effectsMode === "solid" ? "glass" : "solid");
  }, [effectsMode, setEffectsMode]);

  const value = useMemo<UiPreferencesContextValue>(
    () => ({
      effectsMode,
      reducedMotion,
      setEffectsMode,
      toggleEffectsMode,
    }),
    [effectsMode, reducedMotion, setEffectsMode, toggleEffectsMode]
  );

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>;
}

export function useUiPreferences() {
  const context = useContext(UiPreferencesContext);

  if (!context) {
    throw new Error("useUiPreferences must be used within UiPreferencesProvider");
  }

  return context;
}
