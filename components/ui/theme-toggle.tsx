"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
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
        className="h-8 w-8 rounded-full border-0 shadow-none outline-none ring-0 !bg-slate-800 hover:!bg-slate-700 dark:!bg-slate-800 dark:hover:!bg-slate-700 transition-colors"
      >
        <Sun className="h-4 w-4 text-slate-500 dark:text-slate-400" />
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
          className="group h-8 w-8 rounded-full border-0 shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:outline-none !bg-slate-800 hover:!bg-slate-700 dark:!bg-slate-800 dark:hover:!bg-slate-700 transition-all duration-200 relative overflow-hidden"
        >
          <div className="relative flex items-center justify-center">
            <Sun className="h-4 w-4 text-slate-500 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0 dark:opacity-0" />
            <Moon className="absolute h-4 w-4 text-slate-500 rotate-90 scale-0 transition-all duration-300 ease-in-out opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 dark:from-blue-400/20 dark:to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl dark:bg-background/98 dark:backdrop-blur-xl dark:border-border/50 rounded-xl p-1 min-w-[140px]"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer focus:bg-accent hover:bg-accent rounded-lg px-3 py-2 transition-colors duration-150"
        >
          <Sun className="mr-3 h-4 w-4 text-yellow-500" />
          <span className="font-medium">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer focus:bg-accent hover:bg-accent rounded-lg px-3 py-2 transition-colors duration-150"
        >
          <Moon className="mr-3 h-4 w-4 text-blue-500" />
          <span className="font-medium">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer focus:bg-accent hover:bg-accent rounded-lg px-3 py-2 transition-colors duration-150"
        >
          <Monitor className="mr-3 h-4 w-4 text-gray-500" />
          <span className="font-medium">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
