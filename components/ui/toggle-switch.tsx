"use client";

/** LEGACY UI COMPONENT
 * Kept for backward compatibility with older admin settings controls.
 * Do not use for new UI work; use the standardized `Switch` component.
 */
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const ToggleSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-all duration-300 ease-in-out data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0.5 border-2 border-border data-[state=checked]:border-primary data-[state=unchecked]:border-muted-foreground/30",
        "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:to-white/20 before:transition-all before:duration-300"
      )}
    />
  </SwitchPrimitives.Root>
))
ToggleSwitch.displayName = SwitchPrimitives.Root.displayName

export { ToggleSwitch }
