import { DEFAULT_LOCALE, DEFAULT_LOCALE_COOKIE } from "./constants";

/**
 * Request-like object with cookies and headers.
 * Compatible with Next.js NextRequest and standard Request objects.
 */
export interface LocaleRequest {
  cookies: { get: (name: string) => { value: string } | undefined };
  headers: { get: (name: string) => string | null };
}

export interface GetPreferredLocaleConfig {
  locales: string[];
  /** @default "en" */
  defaultLocale?: string;
  /** @default "NEXT_LOCALE" */
  localeCookie?: string;
}

/**
 * Create a getPreferredLocale function configured with your locales.
 *
 * @example
 * ```typescript
 * const getPreferredLocale = createGetPreferredLocale({
 *   locales: ["en", "fr"],
 * });
 *
 * // In middleware
 * const locale = getPreferredLocale(request);
 * ```
 */
export function createGetPreferredLocale(
  config: GetPreferredLocaleConfig,
): (request: LocaleRequest) => string {
  const {
    locales,
    defaultLocale = locales[0] ?? DEFAULT_LOCALE,
    localeCookie = DEFAULT_LOCALE_COOKIE,
  } = config;

  return (request: LocaleRequest): string => {
    // Check cookie first (user's explicit choice)
    const cookieLocale = request.cookies.get(localeCookie)?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
      return cookieLocale;
    }

    // Fall back to Accept-Language header
    const acceptLanguage = request.headers.get("accept-language");
    if (!acceptLanguage) return defaultLocale;

    const preferred = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, priorityToken] = lang.trim().split(";");
        const priorityMatch = priorityToken?.match(/q=([0-9.]+)/);
        const priority = priorityMatch ? parseFloat(priorityMatch[1]) : 1.0;
        return {
          code: code.split("-")[0].toLowerCase(),
          priority: Number.isNaN(priority) ? 1.0 : priority,
        };
      })
      .sort((a, b) => b.priority - a.priority)
      .find((lang) => locales.includes(lang.code));

    return preferred?.code || defaultLocale;
  };
}
