import { formatMessage } from "./message";
import type {
  TranslateFunction,
  TranslationDictionary,
  TranslationVariables,
} from "./types";

export type CreateTranslateOptions = {
  keySplit?: boolean;
  fallback?: TranslationDictionary;
  debug?: boolean;
  locale?: string;
  fallbackLocale?: string;
};

/**
 * Resolve a key from a dictionary
 */
const resolveKey = (
  dictionary: TranslationDictionary | undefined,
  keyList: string[],
): string | undefined => {
  let parent: unknown = dictionary;

  for (const k of keyList) {
    if (parent && typeof parent === "object" && k in parent) {
      parent = (parent as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof parent === "string" ? parent : undefined;
};

/**
 * Interpolate variables into a string.
 *
 * Handles plain `{name}` and the ICU `plural` / `select` arguments; see
 * `message.ts` for why that subset and no more. The locale is passed through
 * because the plural category is the language's, not the value's: 3 is `few` in
 * Polish and `other` in French.
 */
const interpolate = (
  str: string,
  variables?: TranslationVariables,
  locale?: string,
): string => formatMessage(str, variables, locale);

/**
 * Create a translation function for a given dictionary
 */
export const createTranslate = (
  translation: TranslationDictionary | undefined,
  optionsOrKeySplit: CreateTranslateOptions | boolean = true,
): TranslateFunction => {
  const options: CreateTranslateOptions =
    typeof optionsOrKeySplit === "boolean"
      ? { keySplit: optionsOrKeySplit }
      : optionsOrKeySplit;

  const { keySplit = true, fallback, debug = false, locale, fallbackLocale } = options;

  return (key: string, variables?: TranslationVariables): string => {
    const keyList = keySplit ? key.split(".") : [key];

    // Try primary dictionary
    const value = resolveKey(translation, keyList);
    if (value !== undefined) {
      return interpolate(value, variables, locale);
    }

    // Try fallback dictionary
    if (fallback) {
      const fallbackValue = resolveKey(fallback, keyList);
      if (fallbackValue !== undefined) {
        if (debug) {
          console.warn(
            `[translations] Missing translation for key "${key}" in locale "${locale ?? "unknown"}", using fallback from "${fallbackLocale ?? "default"}"`
          );
        }
        return interpolate(fallbackValue, variables, locale ?? fallbackLocale);
      }
    }

    // No translation found
    if (debug) {
      console.warn(
        `[translations] Missing translation for key "${key}" in locale "${locale ?? "unknown"}"${fallback ? ` and fallback "${fallbackLocale ?? "default"}"` : ""}`
      );
    }

    return key;
  };
};
