"use client";

/** LEGACY UI COMPONENT
 * Kept for backward compatibility with pre-refactor auth/contact flows.
 * Do not use for new UI work; use `Input` + `Label` from the new foundation.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, placeholder, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    // Use label if provided, otherwise fall back to placeholder
    const displayLabel = label || placeholder;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        <input
          {...props}
          id={inputId}
          ref={ref}
          // Only show placeholder if no label is provided, and only when not floating
          placeholder={label ? undefined : (isFloating ? undefined : placeholder)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "peer flex h-12 w-full rounded-md border border-input bg-background hover:bg-accent/5 focus:bg-background px-4 pt-4 pb-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-primary/50",
            className
          )}
        />
        {displayLabel && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 pointer-events-none transition-all duration-200 origin-left",
              isFloating
                ? "top-2 text-xs text-muted-foreground scale-90"
                : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground scale-100"
            )}
          >
            {displayLabel}
          </label>
        )}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200 origin-center",
            isFocused ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
          )}
        />
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
