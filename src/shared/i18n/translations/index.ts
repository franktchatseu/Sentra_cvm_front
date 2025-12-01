// Main translations export - combines all languages
import { Translations } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { sw } from "./sw";

export type { Translations, TranslationKey } from "./types";

export const translations: Record<"en" | "fr" | "es" | "sw", Translations> = {
  en,
  fr,
  es,
  sw,
};

