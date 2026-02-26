"use client";

import type { ReactNode } from "react";

import { AppTranslationProvider } from "@onruntime/translations/next";

import { locales } from "@/lib/translations";

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
      debug={process.env.NODE_ENV === "development"}
      load={(loc, ns) => {
        try {
          return require(`@/locales/${loc}/${ns}.json`);
        } catch {
          return undefined;
        }
      }}
    >
      {children}
    </AppTranslationProvider>
  );
};
