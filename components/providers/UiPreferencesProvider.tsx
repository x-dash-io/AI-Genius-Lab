"use client";

import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UiPreferences } from "@/lib/ui-preferences";

interface UiPreferencesContextValue extends UiPreferences {
  setReducedMotion: (enabled: boolean) => void;
}

const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null);

function readReducedMotionPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => readReducedMotionPreference());

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

  const value: UiPreferencesContextValue = {
    reducedMotion,
    setReducedMotion,
  };

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>;
}
