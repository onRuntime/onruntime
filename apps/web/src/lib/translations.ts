import {
  createGetPreferredLocale,
  type LocaleRequest,
  type TranslationLoader,
} from "@onruntime/translations";

export const locales = [
  // Default
  { code: "en", label: "English" },
  // Europe
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "sv", label: "Svenska" },
  // Asia
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  // Middle East / Africa
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  // South Asia
  { code: "hi", label: "हिन्दी" },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const localeCodes = locales.map((l) => l.code);
export const defaultLocale = locales[0].code;

export const load: TranslationLoader = (locale, namespace) => {
  try {
    return require(`@/locales/${locale}/${namespace}.json`);
  } catch {
    return undefined;
  }
};

export const getPreferredLocale = createGetPreferredLocale({
  locales: localeCodes,
}) as (request: LocaleRequest) => Locale;
