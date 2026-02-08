import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 border-none transition-all duration-200 active:translate-y-0 active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200",
        outline:
          "border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm font-bold transition-all duration-200 px-8",
        secondary:
          "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 hover:shadow-sm font-medium transition-all duration-200",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-none transition-all duration-200 font-medium",
        "ghost-destructive": "text-red-600 font-medium hover:bg-red-50 hover:text-red-700 transition-all duration-200",
        link: "text-violet-600 underline-offset-4 hover:underline hover:text-violet-700 font-medium",
        premium: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:brightness-110 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 border-none font-bold px-10 !bg-gradient-to-r !from-amber-500 !to-amber-600",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-button-variant={variant}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
