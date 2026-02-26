export type TranslationValue = string | { [key: string]: TranslationValue };

export type TranslationDictionary = { [key: string]: TranslationValue };

export type TranslationVariables = Record<string, string | number>;

export type TranslateFunction = (
  key: string,
  variables?: TranslationVariables,
) => string;

export type TranslationLoader = (
  locale: string,
  namespace: string,
) => TranslationDictionary | undefined;

export type TranslationConfig = {
  locale: string;
  fallbackLocale?: string;
  keySplit?: boolean;
};

/**
 * Configuration for server-side translation loading.
 * Used by createGetTranslation.
 */
export interface ServerTranslationConfig {
  /** Path to the locales directory (relative to project root). @default "locales" */
  localesDir?: string;
  /** The default/fallback locale. @default "en" */
  defaultLocale?: string;
  /** Enable debug mode to log warnings for missing translations */
  debug?: boolean;
}
