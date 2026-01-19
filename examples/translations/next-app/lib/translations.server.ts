import "server-only";

import { headers } from "next/headers";
import { getTranslation as getTranslationCore } from "@onruntime/translations";

import { load, defaultLocale } from "./translations";

/**
 * Helper for server components - reads locale from x-locale header set by proxy
 */
export const getTranslation = async (namespace = "common") => {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || defaultLocale;
  return getTranslationCore(load, locale, {
    namespace,
    fallbackLocale: defaultLocale,
    debug: process.env.NODE_ENV === "development",
  });
};
