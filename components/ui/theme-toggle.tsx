"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full border-0 shadow-none outline-none ring-0 !bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 transition-colors"
      >
        <Sun className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group h-9 w-9 rounded-full border-0 shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:outline-none !bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 transition-all duration-200 relative overflow-hidden"
        >
          <div className="relative flex items-center justify-center h-5 w-5">
            <Sun className="h-[18px] w-[18px] text-yellow-500 dark:text-yellow-400 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0 dark:opacity-0" />
            <Moon className="absolute h-[18px] w-[18px] text-blue-500 dark:text-blue-400 rotate-90 scale-0 transition-all duration-300 ease-in-out opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-400/30 dark:from-blue-400/30 dark:to-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl dark:bg-background/98 dark:backdrop-blur-xl dark:border-border/50 rounded-xl p-1 min-w-[150px]"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`cursor-pointer focus:bg-accent hover:bg-accent rounded-lg px-3 py-2 transition-all duration-150 ${
            theme === "light" ? "bg-yellow-100 dark:bg-yellow-950/30" : ""
          }`}
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          <span className={`font-medium text-sm ${theme === "light" ? "text-yellow-700 dark:text-yellow-300" : ""}`}>
            Light
          </span>
          {theme === "light" && <span className="ml-auto text-yellow-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`cursor-pointer focus:bg-accent hover:bg-accent rounded-lg px-3 py-2 transition-all duration-150 ${
            theme === "dark" ? "bg-blue-100 dark:bg-blue-950/30" : ""
          }`}
        >
          <Moon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
          <span className={`font-medium text-sm ${theme === "dark" ? "text-blue-700 dark:text-blue-300" : ""}`}>
            Dark
          </span>
          {theme === "dark" && <span className="ml-auto text-blue-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`cursor-pointer focus:bg-accent hover:bg-accent rounded-lg px-3 py-2 transition-all duration-150 ${
            theme === "system" ? "bg-slate-100 dark:bg-slate-800/50" : ""
          }`}
        >
          <Monitor className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span className={`font-medium text-sm ${theme === "system" ? "text-slate-700 dark:text-slate-300" : ""}`}>
            System
          </span>
          {theme === "system" && <span className="ml-auto text-slate-600">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
