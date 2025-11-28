// Language service to manage language settings globally
export type LanguageCode = "en" | "fr" | "es" | "sw";

export interface LanguageSettings {
  language: string; // Language name (e.g., "English")
  language_code: LanguageCode; // ISO 639-1 code (e.g., "en")
}

const DEFAULT_LANGUAGE: LanguageSettings = {
  language: "English",
  language_code: "en",
};

// Language code mapping from language name to code
const LANGUAGE_NAME_TO_CODE: Record<string, LanguageCode> = {
  English: "en",
  French: "fr",
  Spanish: "es",
  Swahili: "sw",
};

// Get language settings from localStorage or return defaults
export const getLanguageSettings = (): LanguageSettings => {
  try {
    const stored = localStorage.getItem("appSettings");
    if (stored) {
      const settings = JSON.parse(stored);
      const languageName = settings.language || DEFAULT_LANGUAGE.language;
      const languageCode =
        LANGUAGE_NAME_TO_CODE[languageName] || DEFAULT_LANGUAGE.language_code;

      return {
        language: languageName,
        language_code: languageCode,
      };
    }
  } catch (error) {
    console.error("Error loading language settings:", error);
  }
  return DEFAULT_LANGUAGE;
};

// Get current language code
export const getCurrentLanguageCode = (): LanguageCode => {
  return getLanguageSettings().language_code;
};

// Set language settings
export const setLanguageSettings = (language: string): void => {
  try {
    const stored = localStorage.getItem("appSettings");
    const settings = stored ? JSON.parse(stored) : {};
    const languageCode = LANGUAGE_NAME_TO_CODE[language] || "en";

    const updatedSettings = {
      ...settings,
      language,
      language_code: languageCode,
    };

    localStorage.setItem("appSettings", JSON.stringify(updatedSettings));
  } catch (error) {
    console.error("Error saving language settings:", error);
  }
};

