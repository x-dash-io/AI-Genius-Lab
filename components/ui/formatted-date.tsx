"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date?: Date;
  className?: string;
}

export function FormattedDate({ date, className }: FormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const dateToFormat = date || new Date();
    setFormattedDate(
      dateToFormat.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, [date]);

  // Return a placeholder or the formatted date
  // Using a span to avoid hydration mismatch by only rendering on client
  return <span className={className}>{formattedDate}</span>;
}
