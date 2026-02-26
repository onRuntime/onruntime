import { createGetPreferredLocale } from "@onruntime/translations";

export const locales = ["en", "fr"];

export const getPreferredLocale = createGetPreferredLocale({ locales });
