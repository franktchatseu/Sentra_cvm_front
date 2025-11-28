// Currency service to manage currency settings globally
interface CurrencySettings {
  currency: string; // Currency code (e.g., "KES", "USD")
  country: string;
  country_code: string;
  number_formatting: string;
}

const DEFAULT_SETTINGS: CurrencySettings = {
  currency: "KES",
  country: "Kenya",
  country_code: "KE",
  number_formatting: "1,234.56",
};

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  KES: "KSh",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  ZAR: "R",
  NGN: "₦",
  GHS: "₵",
  UGX: "USh",
  TZS: "TSh",
  ETB: "Br",
  RWF: "RF",
};

// Get currency settings from localStorage or return defaults
export const getCurrencySettings = (): CurrencySettings => {
  try {
    const stored = localStorage.getItem("appSettings");
    if (stored) {
      const settings = JSON.parse(stored);
      return {
        currency: settings.currency || DEFAULT_SETTINGS.currency,
        country: settings.country || DEFAULT_SETTINGS.country,
        country_code: settings.country_code || DEFAULT_SETTINGS.country_code,
        number_formatting:
          settings.number_formatting || DEFAULT_SETTINGS.number_formatting,
      };
    }
  } catch (error) {
    console.error("Error loading currency settings:", error);
  }
  return DEFAULT_SETTINGS;
};

// Get currency symbol for a given currency code
export const getCurrencySymbol = (currencyCode?: string): string => {
  const settings = getCurrencySettings();
  const code = currencyCode || settings.currency;
  return CURRENCY_SYMBOLS[code] || code;
};

// Format number based on number formatting preference
const formatNumber = (value: number, format: string): string => {
  if (format === "1,234.56") {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (format === "1 234,56") {
    return value.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (format === "1.234,56") {
    return value.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (format === "1'234.56") {
    return value.toLocaleString("de-CH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  // Default to en-US format
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format currency amount
export const formatCurrency = (
  amount: number | string | undefined | null,
  options?: {
    currencyCode?: string;
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  }
): string => {
  if (amount === null || amount === undefined || amount === "") {
    return formatCurrency(0, options);
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return formatCurrency(0, options);
  }

  const settings = getCurrencySettings();
  const currencyCode = options?.currencyCode || settings.currency;
  const showSymbol = options?.showSymbol !== false;
  const showCode = options?.showCode || false;
  const hasFraction = Math.abs(numAmount % 1) > 0;
  const decimals =
    options?.decimals !== undefined ? options.decimals : hasFraction ? 2 : 0;

  // Format number with specified decimals
  const formattedNumber = numAmount.toLocaleString("en-KE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const symbol = getCurrencySymbol(currencyCode);

  if (showCode) {
    return `${formattedNumber} ${currencyCode}`;
  }

  if (showSymbol) {
    // For KES, show "KSh" before the amount
    if (currencyCode === "KES") {
      return `KSh ${formattedNumber}`;
    }
    // For other currencies, use their symbols
    return `${symbol}${formattedNumber}`;
  }

  return formattedNumber;
};

// Format currency without symbol (just the number)
export const formatCurrencyAmount = (
  amount: number | string | undefined | null,
  decimals: number = 2
): string => {
  return formatCurrency(amount, { showSymbol: false, decimals });
};
