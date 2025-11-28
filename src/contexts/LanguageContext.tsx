import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getLanguageSettings,
  setLanguageSettings,
  LanguageCode,
} from "../shared/services/languageService";
import { translations, Translations } from "../shared/i18n/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: string) => void;
  t: Translations;
}

const defaultLanguageContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {
    console.warn("LanguageProvider is not initialized yet.");
  },
  t: translations.en,
};

const LanguageContext = createContext<LanguageContextType>(
  defaultLanguageContext
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return getLanguageSettings().language_code;
  });

  // Update language when settings change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "appSettings") {
        const settings = getLanguageSettings();
        setLanguageState(settings.language_code);
      }
    };

    // Listen for storage changes (from other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically (in case same-tab changes)
    const interval = setInterval(() => {
      const settings = getLanguageSettings();
      if (settings.language_code !== language) {
        setLanguageState(settings.language_code);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [language]);

  const setLanguage = (languageName: string) => {
    setLanguageSettings(languageName);
    const settings = getLanguageSettings();
    setLanguageState(settings.language_code);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Convenience hook for translations
export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
