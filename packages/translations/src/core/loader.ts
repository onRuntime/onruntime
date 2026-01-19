import type { TranslateFunction, TranslationLoader } from "./types";
import { createTranslate } from "./translate";

export type GetTranslationOptions = {
  namespace?: string;
  fallbackLocale?: string;
  debug?: boolean;
};

/**
 * Get translation function for server components or static usage
 *
 * @example
 * ```tsx
 * // Server Component
 * const { t } = getTranslation(load, "en");
 * return <h1>{t("greeting", { name: "John" })}</h1>;
 *
 * // With fallback
 * const { t } = getTranslation(load, "fr", { fallbackLocale: "en", debug: true });
 * ```
 */
export const getTranslation = (
  load: TranslationLoader,
  locale: string,
  optionsOrNamespace: GetTranslationOptions | string = "common",
): { t: TranslateFunction; locale: string } => {
  const options: GetTranslationOptions =
    typeof optionsOrNamespace === "string"
      ? { namespace: optionsOrNamespace }
      : optionsOrNamespace;

  const { namespace = "common", fallbackLocale, debug = false } = options;

  const dictionary = load(locale, namespace);
  const fallbackDictionary =
    fallbackLocale && fallbackLocale !== locale
      ? load(fallbackLocale, namespace)
      : undefined;

  const t = createTranslate(dictionary, {
    keySplit: true,
    fallback: fallbackDictionary,
    debug,
    locale,
    fallbackLocale,
  });

  return { t, locale };
};
