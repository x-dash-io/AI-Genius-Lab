"use client";

import { useMemo, useState } from "react";

interface FormattedDateProps {
  date?: Date;
  className?: string;
}

export function FormattedDate({ date, className }: FormattedDateProps) {
  const [fallbackDate] = useState<Date>(() => new Date());
  const dateToFormat = date ?? fallbackDate;
  const formattedDate = useMemo(
    () =>
      dateToFormat.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [dateToFormat]
  );

  // Return a placeholder or the formatted date
  // Using a span to avoid hydration mismatch by only rendering on client
  return <span className={className}>{formattedDate}</span>;
}
