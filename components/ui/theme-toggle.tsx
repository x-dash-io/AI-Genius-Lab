"use client";

import * as React from "react";
import { Monitor, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useUiPreferences } from "@/components/providers/UiPreferencesProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const effectsOptions = [
  { value: "solid", label: "Solid" },
  { value: "glass", label: "Glass" },
] as const;

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { effectsMode, setEffectsMode } = useUiPreferences();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme ?? "system";

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Appearance">
        <Sun className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Appearance">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentTheme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn("cursor-pointer", isActive && "bg-accent")}
            >
              <Icon className="mr-2 h-4 w-4" />
              {option.label}
              {isActive ? <span className="ml-auto text-xs">✓</span> : null}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Effects
        </DropdownMenuLabel>

        {effectsOptions.map((option) => {
          const isActive = effectsMode === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setEffectsMode(option.value)}
              className={cn("cursor-pointer", isActive && "bg-accent")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {option.label}
              {isActive ? <span className="ml-auto text-xs">✓</span> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
