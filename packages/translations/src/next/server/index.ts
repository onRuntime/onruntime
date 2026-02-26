// Server-only exports for App Router
// This module uses next/headers and should only be imported in Server Components

import { headers } from "next/headers";
import { isAbsolute, join } from "node:path";

import { DEFAULT_LOCALE, DEFAULT_LOCALES_DIR } from "../../core/constants";
import { getTranslation as getTranslationCore } from "../../core/loader";
import type {
  ServerTranslationConfig,
  TranslateFunction,
  TranslationLoader,
} from "../../core/types";

export type { ServerTranslationConfig };

/**
 * Create a getTranslation function for server components.
 * This should only be called in Server Components.
 */
export function createGetTranslation(config: ServerTranslationConfig = {}) {
  const {
    localesDir = DEFAULT_LOCALES_DIR,
    defaultLocale = DEFAULT_LOCALE,
    debug = false,
  } = config;

  // Resolve localesDir relative to project root
  const absoluteLocalesDir = isAbsolute(localesDir)
    ? localesDir
    : join(process.cwd(), localesDir);

  const load: TranslationLoader = (locale: string, namespace: string) => {
    try {
      const filePath = join(absoluteLocalesDir, locale, `${namespace}.json`);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(filePath);
    } catch {
      return undefined;
    }
  };

  return async (namespace = "common"): Promise<{ t: TranslateFunction; locale: string }> => {
    const headersList = await headers();
    const locale = headersList.get("x-locale") || defaultLocale;
    return getTranslationCore(load, locale, {
      namespace,
      fallbackLocale: defaultLocale,
      debug,
    });
  };
}
