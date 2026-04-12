export type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

// Re-export worker constants and types from shared
export * from "./shared";

export interface SitemapConfig {
  /**
   * Base URL of the site (e.g., "https://example.com")
   */
  baseUrl: string;

  /**
   * List of supported locales (e.g., ["en", "fr"])
   */
  locales?: string[];

  /**
   * Default locale (e.g., "en")
   */
  defaultLocale?: string;

  /**
   * Number of URLs per sitemap file (default: 5000)
   */
  urlsPerSitemap?: number;

  /**
   * Locale segment in the URL path (e.g., "[locale]")
   * Auto-detected as "[locale]" when locales or defaultLocale is set
   */
  localeSegment?: string;

  /**
   * Exclude routes from the sitemap
   * Can be an array of glob patterns or a function that returns true to exclude
   * @example exclude: ["/admin/*", "/api/*"]
   * @example exclude: (path) => path.startsWith("/private")
   */
  exclude?: string[] | ((path: string) => boolean);

  /**
   * Priority for sitemap entries
   * Can be a fixed number (0.0-1.0), a function, or "auto" for depth-based calculation
   * Default: "auto" (1.0 - depth * 0.2, minimum 0.1)
   * @example priority: 0.8
   * @example priority: (path) => path === "/" ? 1.0 : 0.7
   * @example priority: "auto"
   */
  priority?: number | "auto" | ((path: string) => number);

  /**
   * Change frequency for sitemap entries
   * Can be a fixed value or a function
   * Default: "weekly"
   * @example changeFreq: "daily"
   * @example changeFreq: (path) => path === "/" ? "daily" : "weekly"
   */
  changeFreq?: ChangeFrequency | ((path: string) => ChangeFrequency);

  /**
   * Additional sitemaps to include in the sitemap index.
   * Use a string for a single sitemap URL, or an object with pattern and count
   * for paginated sitemaps (avoids nesting sitemap indexes).
   * @example additionalSitemaps: [
   *   "/products-sitemap.xml",
   *   { pattern: "/blog/sitemap-{id}.xml", count: 3 }
   * ]
   */
  additionalSitemaps?: AdditionalSitemap[];

  /**
   * Enable debug logging to diagnose issues with route discovery
   * @default false
   */
  debug?: boolean;

  /**
   * Include "Powered by @onruntime/next-sitemap" comment in generated XML
   * @default true
   */
  poweredBy?: boolean;
}

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

/**
 * Calculate priority based on URL depth
 * Root (/) = 1.0, /about = 0.8, /blog/post = 0.6, etc.
 * Minimum priority is 0.1
 */
export function calculateDepthPriority(pathname: string): number {
  if (pathname === "/") return 1.0;
  const depth = pathname.split("/").filter(Boolean).length;
  const priority = Math.max(0.1, 1.0 - depth * 0.2);
  // Round to 2 decimal places to avoid floating point precision issues
  return Math.round(priority * 100) / 100;
}

/**
 * Check if a path should be excluded based on patterns or function
 */
export function shouldExclude(
  pathname: string,
  exclude?: string[] | ((path: string) => boolean)
): boolean {
  if (!exclude) return false;

  if (typeof exclude === "function") {
    return exclude(pathname);
  }

  // Simple glob matching: * matches any characters, ** matches any path segments
  return exclude.some((pattern) => {
    const regexPattern = pattern
      .replace(/\*\*/g, "{{DOUBLE_STAR}}")
      .replace(/\*/g, "[^/]*")
      .replace(/\{\{DOUBLE_STAR\}\}/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });
}

/**
 * Get priority for a pathname based on config
 */
export function getPriority(
  pathname: string,
  priority?: number | "auto" | ((path: string) => number)
): number {
  if (priority === undefined || priority === "auto") {
    return calculateDepthPriority(pathname);
  }
  if (typeof priority === "function") {
    return priority(pathname);
  }
  return priority;
}

/**
 * Get change frequency for a pathname based on config
 */
export function getChangeFreq(
  pathname: string,
  changeFreq?: ChangeFrequency | ((path: string) => ChangeFrequency)
): ChangeFrequency {
  if (changeFreq === undefined) {
    return "weekly";
  }
  if (typeof changeFreq === "function") {
    return changeFreq(pathname);
  }
  return changeFreq;
}

export interface RouteInfo {
  pathname: string;
  dynamicSegments: string[];
  hasGenerateStaticParams: boolean;
}

export type PageModule = {
  generateStaticParams?: () => Promise<Record<string, string>[]>;
};

/**
 * Normalize pathname by removing trailing slash (except for root)
 */
export function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * Format a Date to W3C Datetime format without milliseconds
 * Output format: YYYY-MM-DDThh:mm:ss+00:00
 */
function formatDateW3C(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

/**
 * Generate the full URL for a pathname
 */
export function buildUrl(
  baseUrl: string,
  pathname: string,
  locale?: string,
  defaultLocale?: string
): string {
  const normalizedPath = normalizePath(pathname);
  // For root path, don't add trailing slash
  const pathSuffix = pathname === "/" ? "" : normalizedPath;
  if (!locale || locale === defaultLocale) {
    return `${baseUrl}${pathSuffix}`;
  }
  return `${baseUrl}/${locale}${pathSuffix}`;
}

/**
 * Generate sitemap XML from entries
 */
export function generateSitemapXml(
  entries: SitemapEntry[],
  options?: { poweredBy?: boolean }
): string {
  const { poweredBy = true } = options || {};
  const hasAlternates = entries.some((e) => e.alternates?.languages);
  const xmlns = hasAlternates
    ? 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'
    : 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  const urlEntries = entries
    .map((entry) => {
      const parts = [`    <loc>${entry.url}</loc>`];

      if (entry.alternates?.languages) {
        for (const [lang, href] of Object.entries(entry.alternates.languages)) {
          parts.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`);
        }
      }

      if (entry.lastModified) {
        const date =
          entry.lastModified instanceof Date
            ? formatDateW3C(entry.lastModified)
            : entry.lastModified;
        parts.push(`    <lastmod>${date}</lastmod>`);
      }

      if (entry.changeFrequency) {
        parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      }

      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority}</priority>`);
      }

      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  const comment = poweredBy ? "\n<!-- Powered by @onruntime/next-sitemap -->" : "";
  return `<?xml version="1.0" encoding="UTF-8"?>${comment}\n<urlset ${xmlns}>\n${urlEntries}\n</urlset>`;
}

/**
 * Generate sitemap index XML
 */
export type AdditionalSitemap = string | { pattern: string; count: number };

export function generateSitemapIndexXml(
  baseUrl: string,
  sitemapCount: number,
  options?: {
    sitemapPattern?: string;
    additionalSitemaps?: AdditionalSitemap[];
    poweredBy?: boolean;
  }
): string {
  const { sitemapPattern = "/sitemap-{id}.xml", additionalSitemaps = [], poweredBy = true } = options || {};
  const now = formatDateW3C(new Date());

  const makeSitemapEntry = (loc: string) =>
    `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`;

  // Generate entries for paginated sitemaps
  const paginatedEntries = Array.from({ length: sitemapCount }, (_, i) =>
    makeSitemapEntry(`${baseUrl}${sitemapPattern.replace("{id}", String(i))}`),
  );

  // Generate entries for additional sitemaps
  const additionalEntries = additionalSitemaps.flatMap((sitemap) => {
    if (typeof sitemap === "string") {
      const loc = sitemap.startsWith("http") ? sitemap : `${baseUrl}${sitemap}`;
      return [makeSitemapEntry(loc)];
    }
    // Pattern with count: expand into individual sitemap entries
    return Array.from({ length: sitemap.count }, (_, i) =>
      makeSitemapEntry(`${baseUrl}${sitemap.pattern.replace("{id}", String(i))}`),
    );
  });

  const allEntries = [...paginatedEntries, ...additionalEntries].join("\n");
  const comment = poweredBy ? "\n<!-- Powered by @onruntime/next-sitemap -->" : "";

  return `<?xml version="1.0" encoding="UTF-8"?>${comment}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allEntries}\n</sitemapindex>`;
}
