import { useState } from "react";
import { Save } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { color, tw } from "../../../shared/utils/utils";
import countries from "world-countries";
import currencyCodes from "currency-codes";

// Get all countries from world-countries library, sorted alphabetically
const countriesList = countries
  .map((country) => ({
    name: country.name.common,
    code: country.cca2, // ISO 3166-1 alpha-2 code
    flag: country.flag, // Emoji flag
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Get all currencies from currency-codes library
const currenciesList = currencyCodes
  .codes()
  .map((code) => {
    const currency = currencyCodes.code(code);
    return {
      code: code || "",
      name: currency ? `${currency.currency} (${code})` : code,
    };
  })
  .filter((c) => c.code && c.name && c.name !== `${c.code} (${c.code})`)
  .sort((a, b) => a.code.localeCompare(b.code));

// Common languages list - using ISO 639-1 codes
const languages = [
  { name: "English", code: "en" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Spanish", code: "es" },
  { name: "Italian", code: "it" },
  { name: "Portuguese", code: "pt" },
  { name: "Dutch", code: "nl" },
  { name: "Swedish", code: "sv" },
  { name: "Norwegian", code: "no" },
  { name: "Danish", code: "da" },
  { name: "Finnish", code: "fi" },
  { name: "Polish", code: "pl" },
  { name: "Greek", code: "el" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Chinese (Simplified)", code: "zh-CN" },
  { name: "Chinese (Traditional)", code: "zh-TW" },
  { name: "Hindi", code: "hi" },
  { name: "Arabic", code: "ar" },
  { name: "Hebrew", code: "he" },
  { name: "Turkish", code: "tr" },
  { name: "Russian", code: "ru" },
  { name: "Swahili", code: "sw" },
].sort((a, b) => a.name.localeCompare(b.name));

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Zurich",
  "Europe/Vienna",
  "Europe/Stockholm",
  "Europe/Oslo",
  "Europe/Copenhagen",
  "Europe/Helsinki",
  "Europe/Warsaw",
  "Europe/Lisbon",
  "Europe/Athens",
  "Europe/Dublin",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Manila",
  "Asia/Ho_Chi_Minh",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Jerusalem",
  "Asia/Istanbul",
  "Asia/Moscow",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Dar_es_Salaam",
  "Africa/Kampala",
  "Africa/Accra",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "America/Mexico_City",
  "America/Santiago",
  "America/Bogota",
];

const dateFormats = [
  "YYYY-MM-DD",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "DD-MM-YYYY",
  "MM-DD-YYYY",
  "YYYY/MM/DD",
];

// Currencies are now loaded from currency-codes library above

const numberFormats = ["1,234.56", "1 234,56", "1.234,56", "1'234.56"];

// Helper function to get country by name
const getCountryByName = (countryName: string) => {
  return countriesList.find((c) => c.name === countryName);
};

interface SettingsType {
  country: string;
  country_code: string;
  language: string;
  timezone: string;
  date_format: string;
  currency: string;
  number_formatting: string;
}

export default function SettingsPage() {
  const { success: showToast } = useToast();
  const [settings, setSettings] = useState<SettingsType>({
    country: "United States",
    country_code: "US",
    language: "English",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    currency: "USD",
    number_formatting: "1,234.56",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings] = useState<SettingsType>({
    country: "United States",
    country_code: "US",
    language: "English",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    currency: "USD",
    number_formatting: "1,234.56",
  });

  const handleCountryChange = (countryName: string) => {
    const selectedCountry = getCountryByName(countryName);
    setSettings({
      ...settings,
      country: countryName,
      country_code: selectedCountry?.code || "",
    });
  };

  const handleLanguageChange = (language: string) => {
    setSettings({ ...settings, language });
  };

  const handleTimezoneChange = (timezone: string) => {
    setSettings({ ...settings, timezone });
  };

  const handleDateFormatChange = (date_format: string) => {
    setSettings({ ...settings, date_format });
  };

  const handleCurrencyChange = (currency: string) => {
    setSettings({ ...settings, currency });
  };

  const handleNumberFormatChange = (number_formatting: string) => {
    setSettings({ ...settings, number_formatting });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In the future, this would save to localStorage or backend
      localStorage.setItem("appSettings", JSON.stringify(settings));
      showToast("Settings saved successfully");
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
  };

  const selectStyle = (isFocused: boolean = false) => ({
    borderColor: isFocused ? color.primary.accent : "",
    boxShadow: isFocused ? `0 0 0 2px ${color.primary.accent}33` : "",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-200">
        <div className="min-w-0">
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>Settings</h1>
          <p className={`${tw.textSecondary} mt-2 text-sm`}>
            Manage your system preferences and regional settings
          </p>
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex flex-row items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto whitespace-nowrap">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex-shrink-0 whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium rounded-md text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap"
            style={{ backgroundColor: color.primary.action }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = color.primary.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = color.primary.action;
              }
            }}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-0">
        {/* Location Card */}
        <div className="bg-white rounded-md border border-gray-200 p-5 sm:p-6 lg:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Location
            </h2>
            <p className="text-sm text-gray-500">
              Set your country and regional information
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-semibold text-gray-700 mb-2.5"
              >
                Country
              </label>
              <select
                id="country"
                value={settings.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white cursor-pointer"
                onFocus={(e) => {
                  Object.assign(e.target.style, selectStyle(true));
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, selectStyle(false));
                }}
              >
                {countriesList.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="country-code"
                className="block text-sm font-semibold text-gray-700 mb-2.5"
              >
                Country Code
              </label>
              <input
                id="country-code"
                type="text"
                value={settings.country_code}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-2">
                Automatically set based on selected country
              </p>
            </div>
          </div>
        </div>

        {/* Localization Card */}
        <div className="bg-white rounded-md border border-gray-200 p-5 sm:p-6 lg:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Localization
            </h2>
            <p className="text-sm text-gray-500">
              Configure language and timezone preferences
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-semibold text-gray-700 mb-2.5"
              >
                Language
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white cursor-pointer"
                onFocus={(e) => {
                  Object.assign(e.target.style, selectStyle(true));
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, selectStyle(false));
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-semibold text-gray-700 mb-2.5"
              >
                Timezone
              </label>
              <select
                id="timezone"
                value={settings.timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white cursor-pointer"
                onFocus={(e) => {
                  Object.assign(e.target.style, selectStyle(true));
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, selectStyle(false));
                }}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date Format Card */}
        <div className="bg-white rounded-md border border-gray-200 p-5 sm:p-6 lg:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Date Format
            </h2>
            <p className="text-sm text-gray-500">
              Choose how dates are displayed throughout the system
            </p>
          </div>

          <div>
            <label
              htmlFor="date-format"
              className="block text-sm font-semibold text-gray-700 mb-2.5"
            >
              Format
            </label>
            <select
              id="date-format"
              value={settings.date_format}
              onChange={(e) => handleDateFormatChange(e.target.value)}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white hover:border-gray-400 cursor-pointer"
              onFocus={(e) => {
                Object.assign(e.target.style, selectStyle(true));
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, selectStyle(false));
              }}
            >
              {dateFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  year: settings.date_format.includes("YYYY")
                    ? "numeric"
                    : "2-digit",
                  month: settings.date_format.includes("MM")
                    ? "2-digit"
                    : "short",
                  day: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Currency & Number Formatting Card */}
        <div className="bg-white rounded-md border border-gray-200 p-5 sm:p-6 lg:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Currency & Formatting
            </h2>
            <p className="text-sm text-gray-500">
              Set currency and number display preferences
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-semibold text-gray-700 mb-2.5"
              >
                Currency
              </label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white cursor-pointer"
                onFocus={(e) => {
                  Object.assign(e.target.style, selectStyle(true));
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, selectStyle(false));
                }}
              >
                {currenciesList.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="number-format"
                className="block text-sm font-semibold text-gray-700 mb-2.5"
              >
                Number Formatting
              </label>
              <select
                id="number-format"
                value={settings.number_formatting}
                onChange={(e) => handleNumberFormatChange(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white cursor-pointer"
                onFocus={(e) => {
                  Object.assign(e.target.style, selectStyle(true));
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, selectStyle(false));
                }}
              >
                {numberFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <p className="text-sm font-semibold text-gray-900">
                  1234.56 → {settings.number_formatting}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
