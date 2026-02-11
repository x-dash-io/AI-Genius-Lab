import { type ReactNode } from "react";

export interface ShellBreadcrumb {
  label: string;
  href?: string;
}

export interface AppShellConfig {
  area: "public" | "app" | "admin";
  title?: string;
  breadcrumbs?: ShellBreadcrumb[];
  actions?: ReactNode;
}
