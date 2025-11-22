import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { settingsService } from "../services/settingsService";
import { Settings as SettingsType } from "../types/settings";
import { useToast } from "../../../contexts/ToastContext";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { color, tw } from "../../../shared/utils/utils";

// Comprehensive country list with codes
const countries = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Belgium", code: "BE" },
  { name: "Switzerland", code: "CH" },
  { name: "Austria", code: "AT" },
  { name: "Sweden", code: "SE" },
  { name: "Norway", code: "NO" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Greece", code: "GR" },
  { name: "Ireland", code: "IE" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Singapore", code: "SG" },
  { name: "Malaysia", code: "MY" },
  { name: "Thailand", code: "TH" },
  { name: "Indonesia", code: "ID" },
  { name: "Philippines", code: "PH" },
  { name: "Vietnam", code: "VN" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Israel", code: "IL" },
  { name: "Turkey", code: "TR" },
  { name: "Russia", code: "RU" },
  { name: "South Africa", code: "ZA" },
  { name: "Egypt", code: "EG" },
  { name: "Nigeria", code: "NG" },
  { name: "Kenya", code: "KE" },
  { name: "Brazil", code: "BR" },
  { name: "Argentina", code: "AR" },
  { name: "Mexico", code: "MX" },
  { name: "Chile", code: "CL" },
  { name: "Colombia", code: "CO" },
  { name: "Uganda", code: "UG" },
  { name: "Tanzania", code: "TZ" },
  { name: "Ghana", code: "GH" },
  { name: "Rwanda", code: "RW" },
];

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
];

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

const currencies = [
  { code: "USD", name: "US Dollar ($)" },
  { code: "EUR", name: "Euro (€)" },
  { code: "GBP", name: "British Pound (£)" },
  { code: "JPY", name: "Japanese Yen (¥)" },
  { code: "CNY", name: "Chinese Yuan (¥)" },
  { code: "INR", name: "Indian Rupee (₹)" },
  { code: "AUD", name: "Australian Dollar (A$)" },
  { code: "CAD", name: "Canadian Dollar (C$)" },
  { code: "CHF", name: "Swiss Franc (CHF)" },
  { code: "SEK", name: "Swedish Krona (kr)" },
  { code: "NOK", name: "Norwegian Krone (kr)" },
  { code: "DKK", name: "Danish Krone (kr)" },
  { code: "PLN", name: "Polish Zloty (zł)" },
  { code: "RUB", name: "Russian Ruble (₽)" },
  { code: "BRL", name: "Brazilian Real (R$)" },
  { code: "ZAR", name: "South African Rand (R)" },
  { code: "AED", name: "UAE Dirham (د.إ)" },
  { code: "SAR", name: "Saudi Riyal (﷼)" },
  { code: "SGD", name: "Singapore Dollar (S$)" },
  { code: "HKD", name: "Hong Kong Dollar (HK$)" },
  { code: "KES", name: "Kenyan Shilling (KSh)" },
  { code: "UGX", name: "Ugandan Shilling (USh)" },
  { code: "TZS", name: "Tanzanian Shilling (TSh)" },
  { code: "GHS", name: "Ghanaian Cedi (₵)" },
];

const numberFormats = ["1,234.56", "1 234,56", "1.234,56", "1'234.56"];

export default function SettingsPage() {
  const { success: showToast, error: showError } = useToast();
  const [settings, setSettings] = useState<SettingsType>({
    country: "United States",
    country_code: "US",
    language: "English",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    currency: "USD",
    number_formatting: "1,234.56",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<SettingsType | null>(
    null
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await settingsService.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        setOriginalSettings(response.data);
      } else {
        setOriginalSettings({ ...settings });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setOriginalSettings({ ...settings });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = (countryName: string) => {
    const selectedCountry = countries.find((c) => c.name === countryName);
    setSettings({
      ...settings,
      country: countryName,
      country_code: selectedCountry?.code || "",
    });
    setHasChanges(true);
  };

  const handleLanguageChange = (language: string) => {
    setSettings({ ...settings, language });
    setHasChanges(true);
  };

  const handleTimezoneChange = (timezone: string) => {
    setSettings({ ...settings, timezone });
    setHasChanges(true);
  };

  const handleDateFormatChange = (date_format: string) => {
    setSettings({ ...settings, date_format });
    setHasChanges(true);
  };

  const handleCurrencyChange = (currency: string) => {
    setSettings({ ...settings, currency });
    setHasChanges(true);
  };

  const handleNumberFormatChange = (number_formatting: string) => {
    setSettings({ ...settings, number_formatting });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await settingsService.updateSettings({
        country: settings.country,
        country_code: settings.country_code,
        language: settings.language,
        timezone: settings.timezone,
        date_format: settings.date_format,
        currency: settings.currency,
        number_formatting: settings.number_formatting,
      });
      setOriginalSettings({ ...settings });
      setHasChanges(false);
      showToast("Settings saved successfully");
    } catch (err) {
      console.error("Failed to save settings:", err);
      showError("Failed to save settings", "Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings });
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="modern" size="lg" color="primary" />
      </div>
    );
  }

  const selectStyle = (isFocused: boolean = false) => ({
    borderColor: isFocused ? color.primary.accent : "",
    boxShadow: isFocused ? `0 0 0 2px ${color.primary.accent}33` : "",
  });

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className={`${tw.mainHeading} ${tw.textPrimary}`}>Settings</h1>
          <p className={`${tw.textSecondary} mt-1 text-sm`}>
            Configure your system preferences and regional settings
          </p>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium rounded-md text-white flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}
      </div>

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Location
            </h2>
            <p className="text-sm text-gray-500">
              Set your country and regional information
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country
              </label>
              <select
                id="country"
                value={settings.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white hover:border-gray-400 cursor-pointer"
                onFocus={(e) => {
                  Object.assign(e.target.style, selectStyle(true));
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, selectStyle(false));
                }}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="country-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country Code
              </label>
              <input
                id="country-code"
                type="text"
                value={settings.country_code}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Localization Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Localization
            </h2>
            <p className="text-sm text-gray-500">
              Configure language and timezone preferences
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Language
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white hover:border-gray-400 cursor-pointer"
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Timezone
              </label>
              <select
                id="timezone"
                value={settings.timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white hover:border-gray-400 cursor-pointer"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Date Format
            </h2>
            <p className="text-sm text-gray-500">
              Choose how dates are displayed throughout the system
            </p>
          </div>

          <div>
            <label
              htmlFor="date-format"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Format
            </label>
            <select
              id="date-format"
              value={settings.date_format}
              onChange={(e) => handleDateFormatChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white hover:border-gray-400 cursor-pointer"
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
            <p className="text-xs text-gray-500 mt-2">
              Preview:{" "}
              <span className="font-medium font-mono">
                {new Date().toLocaleDateString("en-US", {
                  year: settings.date_format.includes("YYYY")
                    ? "numeric"
                    : "2-digit",
                  month: settings.date_format.includes("MM")
                    ? "2-digit"
                    : "short",
                  day: "2-digit",
                })}
              </span>
            </p>
          </div>
        </div>

        {/* Currency & Number Formatting Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Currency & Number Formatting
            </h2>
            <p className="text-sm text-gray-500">
              Set currency and number display preferences
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Currency
              </label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white hover:border-gray-400 cursor-pointer"
                onFocus={(e) => {
                  Object.assign(e.target.style, selectStyle(true));
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, selectStyle(false));
                }}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="number-format"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Number Formatting
              </label>
              <select
                id="number-format"
                value={settings.number_formatting}
                onChange={(e) => handleNumberFormatChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none transition-all text-sm bg-white hover:border-gray-400 cursor-pointer"
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
              <p className="text-xs text-gray-500 mt-2">
                Preview: <span className="font-medium font-mono">1234.56</span>{" "}
                →{" "}
                <span className="font-medium font-mono">
                  {settings.number_formatting}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Controls how numbers are displayed (thousands separator, decimal
                separator)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
