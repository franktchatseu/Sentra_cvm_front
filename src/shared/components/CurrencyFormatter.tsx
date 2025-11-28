import { formatCurrency } from "../services/currencyService";

interface CurrencyFormatterProps {
  amount: number | string | undefined | null;
  currencyCode?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
  className?: string;
}

/**
 * Reusable component for formatting and displaying currency amounts.
 * Automatically uses the currency settings from the settings page.
 *
 * @example
 * <CurrencyFormatter amount={1234.56} />
 * // Displays: "KSh 1,234.56" (if KES is set as default)
 *
 * <CurrencyFormatter amount={1234.56} showCode />
 * // Displays: "1,234.56 KES"
 *
 * <CurrencyFormatter amount={1234.56} showSymbol={false} />
 * // Displays: "1,234.56"
 */
export default function CurrencyFormatter({
  amount,
  currencyCode,
  showSymbol = true,
  showCode = false,
  decimals = 2,
  className = "",
}: CurrencyFormatterProps) {
  const formatted = formatCurrency(amount, {
    currencyCode,
    showSymbol,
    showCode,
    decimals,
  });

  return <span className={className}>{formatted}</span>;
}
