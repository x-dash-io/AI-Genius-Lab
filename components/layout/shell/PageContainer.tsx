import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerWidth = "narrow" | "default" | "wide" | "full";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  width?: ContainerWidth;
  padded?: boolean;
}

const widthMap: Record<ContainerWidth, string> = {
  narrow: "max-w-4xl",
  default: "max-w-7xl",
  wide: "max-w-[96rem]",
  full: "max-w-none",
};

export function PageContainer({
  children,
  className,
  width = "default",
  padded = true,
}: PageContainerProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full",
        widthMap[width],
        padded && "px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        className
      )}
    >
      {children}
    </section>
  );
}

