import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
      variants: {
        variant: {
          default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]",
          destructive:
            "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 shadow-md hover:shadow-lg active:scale-[0.98]",
          outline:
            "border-2 border-gray-500 dark:border-gray-400 bg-white/80 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:border-gray-600 dark:hover:border-gray-300 shadow-sm hover:shadow-md font-semibold text-foreground transition-all active:scale-[0.98]",
          secondary:
            "bg-gray-300 text-gray-900 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 shadow-sm hover:shadow-md font-semibold active:scale-[0.98]",
          ghost: "bg-gray-100/80 dark:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800/70 font-medium text-foreground transition-all active:scale-[0.98]",
          link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline font-medium",
        },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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