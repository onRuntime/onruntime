"use client";

import { createContext, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_LOCALE_COOKIE } from "../../core/constants";
import type { TranslationLoader } from "../../core/types";

export type TranslationContextValue = {
  locale: string;
  locales: readonly string[];
  defaultLocale: string;
  localeCookie: string;
  debug: boolean;
  setLocale: (locale: string) => void;
  load: TranslationLoader;
  keySplit?: boolean;
};

export const TranslationContext = createContext<TranslationContextValue | null>(
  null,
);

export type TranslationProviderProps = {
  children: ReactNode;
  locales: readonly string[];
  defaultLocale?: string;
  localeCookie?: string;
  debug?: boolean;
  load: TranslationLoader;
  keySplit?: boolean;
};

export const TranslationProvider = ({
  children,
  locales,
  defaultLocale,
  localeCookie = DEFAULT_LOCALE_COOKIE,
  debug = false,
  load,
  keySplit = true,
}: TranslationProviderProps) => {
  if (locales.length === 0) {
    throw new Error("TranslationProvider: locales array must not be empty");
  }

  const resolvedDefaultLocale = defaultLocale ?? locales[0];
  const [locale, setLocale] = useState(resolvedDefaultLocale);

  const value = useMemo(
    () => ({
      locale,
      locales,
      defaultLocale: resolvedDefaultLocale,
      localeCookie,
      debug,
      setLocale,
      load,
      keySplit,
    }),
    [locale, locales, resolvedDefaultLocale, localeCookie, debug, load, keySplit],
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
