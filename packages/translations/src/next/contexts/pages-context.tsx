"use client";

import { type ReactNode, useMemo, useCallback } from "react";
import { useRouter } from "next/router";

import { DEFAULT_LOCALE, DEFAULT_LOCALE_COOKIE } from "../../core/constants";
import type { TranslationLoader } from "../../core/types";
import { TranslationContext } from "../../react/contexts/translation-context";

export type NextTranslationProviderProps = {
  children: ReactNode;
  localeCookie?: string;
  debug?: boolean;
  load: TranslationLoader;
  keySplit?: boolean;
};

/**
 * Translation provider for Next.js Pages Router
 * Automatically uses locale info from Next.js router
 */
export const NextTranslationProvider = ({
  children,
  localeCookie = DEFAULT_LOCALE_COOKIE,
  debug = false,
  load,
  keySplit = true,
}: NextTranslationProviderProps) => {
  const router = useRouter();
  const locale = router.locale ?? DEFAULT_LOCALE;
  const locales = router.locales ?? [DEFAULT_LOCALE];
  const defaultLocale = router.defaultLocale ?? DEFAULT_LOCALE;

  const setLocale = useCallback(
    (newLocale: string) => {
      // Set cookie to remember user's choice
      const isSecure = window.location.protocol === "https:";
      document.cookie = `${localeCookie}=${newLocale};path=/;max-age=31536000;SameSite=Lax${isSecure ? ";Secure" : ""}`;
      router.push(router.pathname, router.asPath, {
        locale: newLocale,
        scroll: false,
      });
    },
    [router, localeCookie],
  );

  const value = useMemo(
    () => ({
      locale,
      locales,
      defaultLocale,
      localeCookie,
      debug,
      setLocale,
      load,
      keySplit,
    }),
    [locale, locales, defaultLocale, localeCookie, debug, setLocale, load, keySplit],
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
