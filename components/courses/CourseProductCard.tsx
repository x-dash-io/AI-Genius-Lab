"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Ellipsis, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { canOptimizeImageUrl, normalizeImageUrl, passthroughImageLoader } from "@/lib/images";

interface CourseAction {
  href: string;
  label: string;
}

interface CourseMetaItem {
  label: string;
  value: string;
}

interface CourseProductCardProps {
  title: string;
  description?: string | null;
  slug: string;
  categoryLabel: string;
  priceLabel: string;
  imageUrl?: string | null;
  tierLabel?: string;
  metaItems: CourseMetaItem[];
  primaryAction: CourseAction;
  secondaryActions?: CourseAction[];
  className?: string;
}

function CourseImageFallback({ categoryLabel }: { categoryLabel: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(145deg,hsl(var(--primary)_/_0.16),hsl(var(--accent)_/_0.6))]">
      <div className="grid gap-2 text-center">
        <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background/70 text-primary">
          <BookOpen className="h-5 w-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/90">{categoryLabel}</p>
      </div>
    </div>
  );
}

export function CourseProductCard({
  title,
  description,
  slug,
  categoryLabel,
  priceLabel,
  imageUrl,
  tierLabel,
  metaItems,
  primaryAction,
  secondaryActions = [],
  className,
}: CourseProductCardProps) {
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const resolvedImage = normalizeImageUrl(imageUrl);
  const usePassthroughLoader = resolvedImage ? !canOptimizeImageUrl(resolvedImage) : false;
  const hasImageError = Boolean(resolvedImage && failedImage === resolvedImage);
  const isImageLoaded = Boolean(resolvedImage && loadedImage === resolvedImage);

  return (
    <Card className={cn("ui-surface supports-hover-card flex h-full flex-col overflow-hidden border", className)}>
      <div className="relative aspect-video overflow-hidden border-b bg-muted/25">
        {resolvedImage && !hasImageError ? (
          <>
            <Image
              key={resolvedImage}
              src={resolvedImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              loader={usePassthroughLoader ? passthroughImageLoader : undefined}
              unoptimized={usePassthroughLoader}
              onLoad={() => {
                setLoadedImage(resolvedImage);
                setFailedImage((prev) => (prev === resolvedImage ? null : prev));
              }}
              onError={() => {
                setFailedImage(resolvedImage);
              }}
            />
            {!isImageLoaded ? <Skeleton className="absolute inset-0" /> : null}
          </>
        ) : (
          <CourseImageFallback categoryLabel={categoryLabel} />
        )}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Badge
            variant="secondary"
            title={categoryLabel}
            className="max-w-[65%] truncate px-2.5 py-1 text-[11px] font-semibold"
          >
            {categoryLabel}
          </Badge>
          <span className="shrink-0 rounded-full border border-border/80 bg-background/95 px-3 py-1.5 text-sm font-bold leading-none text-foreground shadow-sm backdrop-blur-sm tabular-nums">
            {priceLabel}
          </span>
        </div>

        {tierLabel ? (
          <div className="absolute inset-x-3 bottom-3 flex justify-end">
            <Badge variant="outline" className="gap-1 bg-background/85">
              <GraduationCap className="h-3.5 w-3.5" />
              {tierLabel}
            </Badge>
          </div>
        ) : null}
      </div>

      <CardHeader className="space-y-2">
        <CardTitle className="line-clamp-2 text-xl">{title}</CardTitle>
        <CardDescription className="line-clamp-3 text-sm">
          {description || "Structured practical curriculum designed for measurable project outcomes."}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-auto grid gap-4">
        <div className="flex flex-wrap gap-2">
          {metaItems.map((item) => (
            <span
              key={`${slug}-${item.label}`}
              className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground"
            >
              <span className="font-semibold text-foreground">{item.label}:</span> {item.value}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href={primaryAction.href} className="flex-1">
            <Button className="h-11 w-full" variant="premium">
              {primaryAction.label}
            </Button>
          </Link>

          {secondaryActions.length ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                {secondaryActions.map((action) => (
                  <Link key={`${slug}-${action.label}`} href={action.href}>
                    <Button className="h-11" variant="outline">
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>

              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label="More course actions"
                      className="h-11 w-11"
                      variant="outline"
                      size="icon"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {secondaryActions.map((action) => (
                      <DropdownMenuItem key={`${slug}-mobile-${action.label}`} asChild>
                        <Link href={action.href}>{action.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
