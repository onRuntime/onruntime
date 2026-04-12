import { existsSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import type { NextApiRequest, NextApiResponse, MetadataRoute } from "next";
import {
  type SitemapConfig,
  type SitemapEntry,
  type ChangeFrequency,
  generateSitemapXml,
  generateSitemapIndexXml,
  shouldExclude,
} from "..";
import {
  type RouteInfo,
  generateAllPaths,
  pathsToEntries,
} from "../shared";
import { generateRobotsTxt, type RobotsConfig } from "./robots";

export * from "./robots";
export type { RobotsConfig };
export type { SitemapConfig, SitemapEntry, ChangeFrequency, MetadataRoute };

export interface CreateSitemapApiHandlerOptions extends SitemapConfig {
  /**
   * Path to the pages directory to scan for page files.
   * Can be absolute or relative to process.cwd().
   * If not provided, auto-detects src/pages or pages.
   * @deprecated Use routes-manifest.json from .next directory instead
   */
  pagesDirectory?: string;
}

// ============================================================================
// Route Discovery (Pages Router specific)
// ============================================================================

interface RoutesManifestRoute {
  page: string;
  regex: string;
  routeKeys?: Record<string, string>;
  namedRegex?: string;
}

interface RoutesManifest {
  staticRoutes?: RoutesManifestRoute[];
  dynamicRoutes?: RoutesManifestRoute[];
}

/**
 * Read routes from Next.js routes-manifest.json (production-safe)
 */
function readRoutesManifest(debug: boolean): RoutesManifest | null {
  const manifestPath = join(process.cwd(), ".next", "routes-manifest.json");

  if (!existsSync(manifestPath)) {
    if (debug) {
      console.log(`[next-sitemap] routes-manifest.json not found at ${manifestPath}`);
    }
    return null;
  }

  try {
    const content = readFileSync(manifestPath, "utf-8");
    return JSON.parse(content) as RoutesManifest;
  } catch (err) {
    if (debug) {
      console.warn(`[next-sitemap] Failed to read routes-manifest.json:`, err);
    }
    return null;
  }
}

/**
 * Extract routes from routes-manifest.json
 */
function extractRoutesFromManifest(manifest: RoutesManifest): RouteInfo[] {
  const routes: RouteInfo[] = [];

  // Process static routes
  for (const route of manifest.staticRoutes ?? []) {
    // Skip API routes
    if (route.page.startsWith("/api/")) continue;

    routes.push({
      pathname: route.page,
      dynamicSegments: [],
      fileKey: route.page,
    });
  }

  // Process dynamic routes
  for (const route of manifest.dynamicRoutes ?? []) {
    // Skip API routes and catch-all routes
    if (route.page.startsWith("/api/")) continue;
    if (route.page.includes("[...")) continue;

    const dynamicSegments = route.page
      .match(/\[([^\]]+)\]/g)
      ?.map((s) => s.slice(1, -1)) ?? [];

    routes.push({
      pathname: route.page,
      dynamicSegments,
      fileKey: route.page,
    });
  }

  return routes;
}

/**
 * Recursively find all page files in a directory (fallback for dev mode)
 */
function findPageFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip api directory
        if (entry.name === "api") continue;
        files.push(...findPageFiles(fullPath, baseDir));
      } else if (
        /\.(tsx?|jsx?)$/.test(entry.name) &&
        !entry.name.startsWith("_") // Skip _app, _document, etc.
      ) {
        const relativePath = "./" + relative(baseDir, fullPath).replace(/\\/g, "/");
        files.push(relativePath);
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return files;
}

/**
 * Resolve the pages directory path
 */
function resolvePagesDirectory(pagesDirectory?: string): string {
  if (pagesDirectory) {
    return isAbsolute(pagesDirectory) ? pagesDirectory : join(process.cwd(), pagesDirectory);
  }
  // Auto-detect: prefer src/pages over pages
  const srcPages = join(process.cwd(), "src/pages");
  return existsSync(srcPages) ? srcPages : join(process.cwd(), "pages");
}

/**
 * Extract route info from page file paths (fallback for dev mode)
 */
function extractRoutesFromFiles(pageKeys: string[], localeSegment: string): RouteInfo[] {
  const routes: RouteInfo[] = [];

  for (const key of pageKeys) {
    // Skip catch-all routes
    if (key.includes("[...")) continue;

    // Convert file path to URL path
    let pathname = key
      .replace(/^\.\//, "/")
      .replace(/\.(tsx?|jsx?)$/, "")
      .replace(/\/index$/, "/");

    // Normalize root
    if (pathname === "") pathname = "/";

    // Strip locale segment if configured
    if (localeSegment) {
      const escapedSegment = localeSegment.replace(/[[\]]/g, "\\$&");
      pathname = pathname.replace(new RegExp(`^/${escapedSegment}`), "");
    }

    // Skip invalid paths containing src/ or pages/ segments
    if (/(?:^|\/)(src|pages)(?:\/|$)/.test(pathname)) continue;

    // Normalize pathname
    if (!pathname || pathname === "") {
      pathname = "/";
    } else if (!pathname.startsWith("/")) {
      pathname = "/" + pathname;
    }

    const dynamicSegments = pathname.match(/\[([^\]]+)\]/g)?.map((s) => s.slice(1, -1)) ?? [];

    routes.push({ pathname, dynamicSegments, fileKey: key });
  }

  return routes;
}

/**
 * Get routes using manifest (preferred) or file scanning (fallback)
 */
function getRoutes(pagesDirectory: string | undefined, localeSegment: string, debug: boolean): RouteInfo[] {
  // Try to use routes-manifest.json first (works in production/Docker)
  const manifest = readRoutesManifest(debug);

  if (manifest && (manifest.staticRoutes || manifest.dynamicRoutes)) {
    if (debug) {
      console.log(`[next-sitemap] Using routes-manifest.json for route discovery`);
    }
    return extractRoutesFromManifest(manifest);
  }

  // Fallback to file scanning (dev mode without build)
  if (debug) {
    console.log(`[next-sitemap] Falling back to file scanning for route discovery`);
  }
  const pagesDir = resolvePagesDirectory(pagesDirectory);
  const pageKeys = findPageFiles(pagesDir);
  return extractRoutesFromFiles(pageKeys, localeSegment);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get the directory for worker execution (source or compiled)
 */
function getWorkerDirectory(pagesDirectory?: string): string {
  // In production, use compiled files from .next/server/pages
  const compiledDir = join(process.cwd(), ".next", "server", "pages");
  if (existsSync(compiledDir)) {
    return compiledDir;
  }
  // Fallback to source directory for dev mode
  return resolvePagesDirectory(pagesDirectory);
}

/**
 * Create API handler for sitemap index route
 * Use in: pages/api/sitemap.xml.ts
 */
export function createSitemapIndexApiHandler(options: CreateSitemapApiHandlerOptions) {
  const { urlsPerSitemap = 5000, additionalSitemaps, exclude, debug = false } = options;
  const localeSegment = options.localeSegment ?? "";

  return async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const routes = getRoutes(options.pagesDirectory, localeSegment, debug);
    const workerDir = getWorkerDirectory(options.pagesDirectory);

    if (debug) {
      console.log(`[next-sitemap] Found ${routes.length} routes`);
      console.log(`[next-sitemap] Worker directory: ${workerDir}`);
    }

    const allPaths = await generateAllPaths(routes, workerDir, debug);
    const filteredPaths = allPaths.filter((p) => !shouldExclude(p, exclude));
    const sitemapCount = Math.max(1, Math.ceil(filteredPaths.length / urlsPerSitemap));

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(
      generateSitemapIndexXml(options.baseUrl, sitemapCount, { additionalSitemaps, poweredBy: options.poweredBy })
    );
  };
}

/**
 * Create API handler for individual sitemap routes
 * Use in: pages/api/sitemap/[id].ts
 */
export function createSitemapApiHandler(options: CreateSitemapApiHandlerOptions) {
  const { urlsPerSitemap = 5000, exclude, debug = false } = options;
  const localeSegment = options.localeSegment ?? "";

  const getFilteredPaths = async () => {
    const routes = getRoutes(options.pagesDirectory, localeSegment, debug);
    const workerDir = getWorkerDirectory(options.pagesDirectory);
    const allPaths = await generateAllPaths(routes, workerDir, debug);
    return allPaths.filter((p) => !shouldExclude(p, exclude));
  };

  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const sitemapId = parseInt(Array.isArray(id) ? id[0] : id || "0", 10);

    const filteredPaths = await getFilteredPaths();
    const paths = filteredPaths.slice(sitemapId * urlsPerSitemap, (sitemapId + 1) * urlsPerSitemap);
    const entries = pathsToEntries(paths, { ...options, exclude: undefined });

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(generateSitemapXml(entries, { poweredBy: options.poweredBy }));
  };
}

/**
 * Get the list of sitemap IDs for getStaticPaths
 * Use this to pre-render sitemap pages at build time
 */
export async function getSitemapStaticPaths(options: CreateSitemapApiHandlerOptions) {
  const { urlsPerSitemap = 5000, exclude, debug = false } = options;
  const localeSegment = options.localeSegment ?? "";
  const routes = getRoutes(options.pagesDirectory, localeSegment, debug);
  const workerDir = getWorkerDirectory(options.pagesDirectory);

  const allPaths = await generateAllPaths(routes, workerDir, debug);
  const filteredPaths = allPaths.filter((pathname) => !shouldExclude(pathname, exclude));
  const sitemapCount = Math.max(1, Math.ceil(filteredPaths.length / urlsPerSitemap));

  return {
    paths: Array.from({ length: sitemapCount }, (_, i) => ({
      params: { id: String(i) },
    })),
    fallback: false,
  };
}

/**
 * Create API handler for robots.txt
 * Use in: pages/api/robots.txt.ts
 */
export function createRobotsApiHandler(config: RobotsConfig) {
  return function handler(_req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(generateRobotsTxt(config));
  };
}
