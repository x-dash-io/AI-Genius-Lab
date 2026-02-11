"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordFieldProps extends Omit<InputProps, "type"> {
  id: string;
  label: string;
  hint?: string;
}

export function PasswordField({ id, label, hint, className, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          className={cn(
            "h-11 border-input/85 bg-background/90 pr-12 text-sm shadow-[inset_0_1px_0_hsl(var(--background)),var(--shadow-sm)] focus-visible:border-primary/60 focus-visible:ring-primary/30",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          className="absolute right-1 top-1 inline-flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-accent/65 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label={isVisible ? "Hide password" : "Show password"}
          tabIndex={props.disabled ? -1 : 0}
          disabled={props.disabled}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
