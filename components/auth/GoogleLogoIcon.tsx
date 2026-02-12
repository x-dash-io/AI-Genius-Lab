import Image from "next/image";
import { cn } from "@/lib/utils";

interface GoogleLogoIconProps {
  className?: string;
}

export function GoogleLogoIcon({ className }: GoogleLogoIconProps) {
  return (
    <Image
      src="/logos/google.png"
      alt=""
      aria-hidden="true"
      width={16}
      height={16}
      className={cn("h-4 w-4 object-contain", className)}
    />
  );
}
