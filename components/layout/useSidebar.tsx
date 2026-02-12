"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const SidebarContext = createContext<{
  isCollapsed: boolean;
  toggleCollapsed: () => void;
} | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapsed = () => setIsCollapsed((collapsed) => !collapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
