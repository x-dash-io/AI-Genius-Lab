"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, CreditCard, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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
  planIncluded?: boolean;
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
  planIncluded = false,
  className,
}: CourseProductCardProps) {
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const resolvedImage = normalizeImageUrl(imageUrl);
  const usePassthroughLoader = resolvedImage ? !canOptimizeImageUrl(resolvedImage) : false;
  const hasImageError = Boolean(resolvedImage && failedImage === resolvedImage);
  const isImageLoaded = Boolean(resolvedImage && loadedImage === resolvedImage);
  const normalizedTier = (tierLabel || "").trim().toLowerCase();
  const isAdvancedTier = normalizedTier.includes("advanced");
  const isCoreTier = normalizedTier.includes("core");

  return (
    <Card
      className={cn(
        "group ui-surface supports-hover-card flex h-full flex-col overflow-hidden border border-border/70 bg-card/90",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted/25">
        {resolvedImage && !hasImageError ? (
          <>
            <Image
              key={resolvedImage}
              src={resolvedImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            title={categoryLabel}
            className="max-w-[62%] truncate border-white/35 bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur"
          >
            {categoryLabel}
          </Badge>
          {tierLabel ? (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border shadow-sm backdrop-blur",
                isAdvancedTier
                  ? "border-primary/35 bg-primary/75 text-white dark:bg-primary/60"
                  : isCoreTier
                    ? "border-success/35 bg-success/75 text-white dark:bg-success/60"
                    : "border-white/35 bg-black/55 text-white"
              )}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              {tierLabel}
            </Badge>
          ) : null}
        </div>

        <div className="absolute inset-x-3 bottom-3">
          <span className="inline-flex rounded-full border border-primary/35 bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(260_88%_63%)_100%)] px-3 py-1.5 text-sm font-bold leading-none text-white shadow-[0_12px_24px_hsl(var(--primary)/0.28)] tabular-nums">
            {priceLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="space-y-2">
          <CardTitle className="line-clamp-2 text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="line-clamp-3 text-sm leading-relaxed">
            {description || "Structured practical curriculum designed for measurable project outcomes."}
          </CardDescription>
          {planIncluded ? (
            <Badge
              variant="outline"
              className="mt-2 inline-flex w-fit items-center gap-1 border-success/30 bg-success/10 text-xs font-semibold text-success"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Included with your plan
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {metaItems.map((item) => (
            <div
              key={`${slug}-${item.label}`}
              className="rounded-xl border border-border/70 bg-background/80 px-3 py-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Link href={primaryAction.href} className="block min-w-0">
            <Button
              className="h-11 w-full justify-between rounded-xl px-4 text-sm font-semibold whitespace-normal"
              variant="premium"
            >
              <span className="min-w-0 truncate text-left">{primaryAction.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Button>
          </Link>

          {secondaryActions.length ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {secondaryActions.map((action) => {
                const isSubscriptionAction = action.label.toLowerCase().includes("subscription");

                return (
                  <Link
                    key={`${slug}-${action.label}`}
                    href={action.href}
                    className={cn("block min-w-0", secondaryActions.length === 1 && "sm:col-span-2")}
                  >
                    <Button
                      className={cn(
                        "h-11 w-full rounded-xl px-4 text-sm font-semibold whitespace-normal",
                        isSubscriptionAction &&
                          "justify-between border-primary/35 bg-primary/10 text-foreground shadow-sm hover:bg-primary/15 hover:text-foreground"
                      )}
                      variant={isSubscriptionAction ? "secondary" : "outline"}
                    >
                      <span className="min-w-0 truncate">{action.label}</span>
                      {isSubscriptionAction ? <CreditCard className="h-4 w-4 shrink-0 text-primary" /> : null}
                    </Button>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
