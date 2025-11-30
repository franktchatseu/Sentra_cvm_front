import { formatDate, formatDateLocale } from "../services/dateService";

interface DateFormatterProps {
  date: Date | string | number | null | undefined;
  includeTime?: boolean;
  useLocale?: boolean;
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  className?: string;
}

/**
 * Reusable component for formatting and displaying dates.
 * Automatically uses the date format settings from the settings page.
 *
 * @example
 * <DateFormatter date={new Date()} />
 * // Displays: "2025-01-18" (if YYYY-MM-DD is set as default)
 *
 * <DateFormatter date={new Date()} includeTime />
 * // Displays: "2025-01-18 14:30:00"
 *
 * <DateFormatter date={new Date()} useLocale />
 * // Displays: "Jan 18, 2025" (locale-aware formatting)
 */
export default function DateFormatter({
  date,
  includeTime = false,
  useLocale = false,
  year,
  month,
  day,
  className = "",
}: DateFormatterProps) {
  const formatted = useLocale
    ? formatDateLocale(date, { includeTime, year, month, day })
    : formatDate(date, { includeTime });

  return <span className={className}>{formatted}</span>;
}

