"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AppTranslationProvider } from "@onruntime/translations/next";

import { load, localeCodes } from "@/lib/translations";

type ProvidersProps = {
  children: ReactNode;
  locale: string;
};

export const Providers = ({ children, locale }: ProvidersProps) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppTranslationProvider locale={locale} locales={localeCodes} load={load}>
        {children}
      </AppTranslationProvider>
    </ThemeProvider>
  );
};
