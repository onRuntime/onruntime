"use client";

import type { ReactNode } from "react";
import { AppTranslationProvider } from "@onruntime/translations/next";

import { load, locales, LOCALE_COOKIE } from "@/lib/translations";

export const Providers = ({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) => {
  return (
    <AppTranslationProvider
      locale={locale}
      locales={locales}
      localeCookie={LOCALE_COOKIE}
      load={load}
    >
      {children}
    </AppTranslationProvider>
  );
};
