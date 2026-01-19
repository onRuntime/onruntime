"use client";

import { useMemo } from "react";

import type { TranslateFunction, TranslationDictionary } from "../../core/types";
import { createTranslate } from "../../core/translate";
import { useTranslationContext } from "./use-translation-context";

export const useTranslationLoader = (
  namespace: string,
): {
  translation: TranslationDictionary | undefined;
  t: TranslateFunction;
  locale: string;
} => {
  const { locale, defaultLocale, load, keySplit, debug } = useTranslationContext();

  const translation = useMemo(() => load(locale, namespace), [locale, namespace, load]);

  const fallbackTranslation = useMemo(() => {
    if (defaultLocale !== locale) {
      return load(defaultLocale, namespace);
    }
    return undefined;
  }, [defaultLocale, locale, namespace, load]);

  const t = useMemo(
    () =>
      createTranslate(translation, {
        keySplit,
        fallback: fallbackTranslation,
        debug,
        locale,
        fallbackLocale: defaultLocale,
      }),
    [translation, fallbackTranslation, keySplit, debug, locale, defaultLocale],
  );

  return { translation, t, locale };
};
