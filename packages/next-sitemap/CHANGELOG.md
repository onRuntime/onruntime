# @onruntime/next-sitemap

## 0.9.5

### Patch Changes

- bcfb825: Add support for paginated additional sitemaps via `{ pattern, count }` objects to avoid nesting sitemap indexes

## 0.9.4

### Patch Changes

- 867205f: Fix crash with Turbopack in dev mode where routes-manifest.json exists but staticRoutes and dynamicRoutes are undefined

## 0.9.3

### Patch Changes

- 6ae7d68: Fix lastmod date format to use W3C Datetime without milliseconds (YYYY-MM-DDThh:mm:ss+00:00) for better compatibility with sitemap validators

## 0.9.2

### Patch Changes

- 48b8573: Fix trailing slash on root URL (e.g., `https://example.com` instead of `https://example.com/`)

## 0.9.1

### Patch Changes

- 3903a3d: Fix trailing slash on root URL with locales (e.g., `/fr` instead of `/fr/`)

## 0.9.0

### Minor Changes

- Fix Pages Router sitemap generation in Docker/production environments by reading from routes-manifest.json instead of scanning source files

## 0.8.0

### Minor Changes

- c156f05: Add "Powered by @onruntime/next-sitemap" signature in generated XML and robots.txt

  - Add `poweredBy` option (default: `true`) to include/exclude the signature comment
  - Sitemap XML: `<!-- Powered by @onruntime/next-sitemap -->`
  - robots.txt: `# Powered by @onruntime/next-sitemap`
  - New `RobotsConfig` type extends `MetadataRoute.Robots` with `poweredBy` option
  - Worker now has generic module mocking for better compatibility:
    - Auto-mocks `server-only`, `client-only`, and bare `env` import via jiti aliases
    - Generic fallback: any module that fails to resolve or load is automatically mocked with a Proxy

## 0.7.0

### Minor Changes

- ed5e4b9: Refactor to use isolated child process worker for executing `generateStaticParams` and `getStaticPaths`

  - Add worker process isolation using `child_process.spawn` with jiti for TypeScript support
  - Add ESM loader hook to mock non-JS imports (CSS, images, etc.) in worker context
  - Execute dynamic routes in parallel for improved performance
  - Add dev mode logging with timing information
  - Consolidate shared utilities into `src/shared.ts`
  - Add worker tests

## 0.6.2

### Patch Changes

- 0fde59f: Fix Turbopack static analysis warning for dynamic path construction

  Use indirect function reference for `path.join` to prevent Turbopack from matching overly broad file patterns during static analysis.

## 0.6.1

### Patch Changes

- fdcce2b: Add tsconfig path alias support and .js/.jsx file scanning

  - Add automatic tsconfig.json path alias resolution (`@/*` -> `./src/*`)
  - Add `strip-json-comments` for robust JSONC parsing
  - Support `.js` and `.jsx` files in addition to `.ts` and `.tsx`
  - Improve jiti configuration with `interopDefault` and per-project caching

## 0.6.0

### Minor Changes

- f03af8e: Simplify API with automatic route discovery and jiti-powered module imports for both App Router and Pages Router.

  **Breaking changes:**

  - App Router: `pagesDirectory` option renamed to `appDirectory`

  **New features:**

  - Auto-detect `src/app` or `app` directory (App Router) / `src/pages` or `pages` (Pages Router)
  - Use filesystem scanning + jiti for runtime TSX/JSX imports (no more `pagesContext` or `importPage` options)
  - Works reliably in both development and production modes
  - Added jiti as dependency for TypeScript/JSX runtime support

## 0.5.1

### Patch Changes

- 724bbf9: Fix debug logging in App Router - move logs inside GET handler so they appear at request time instead of module initialization

## 0.5.0

### Minor Changes

- ca8aa76: Add robots.txt support for Pages Router with `createRobotsApiHandler` and `generateRobotsTxt` using Next.js `MetadataRoute.Robots` type

## 0.4.1

### Patch Changes

- eb72a36: - Add `normalizePath` function to ensure consistent URLs without trailing slashes
  - Round priority values to 2 decimal places to avoid floating point precision issues
  - Add unit tests for core utilities and XML generation

## 0.4.0

### Minor Changes

- 7f75ff9: Add Pages Router support
  - Add `@onruntime/next-sitemap/pages` export with `createSitemapIndexApiHandler`, `createSitemapApiHandler`, and `getSitemapStaticPaths`
  - Support `getStaticPaths` for dynamic route resolution (in addition to `generateStaticParams` for App Router)
  - Add i18n support for Pages Router via `locales` and `defaultLocale` options
  - Add examples for Pages Router and Pages Router with i18n

## 0.3.0

### Minor Changes

- 7485075: Add debug option and improve error handling for dynamic routes:
  - Add `debug` option to log route discovery and `generateStaticParams` calls
  - Add error handling to prevent crashes when `generateStaticParams` fails
  - Log warnings for dynamic routes without `generateStaticParams`
  - Add troubleshooting section to README with recommended patterns for API/database routes

## 0.2.1

### Patch Changes

- e0c8b00: Fix URL generation issues in sitemap:
  - Fix missing leading slash between domain and path (e.g., `http://localhost:3000articles` → `http://localhost:3000/articles`)
  - Fix invalid `src/app/` paths being included in sitemap
  - Ensure pathnames are properly normalized after route group removal

## 0.2.0

### Minor Changes

- 94b0075: Add new configuration options for sitemap generation:
  - `exclude`: Filter out routes using glob patterns or a function
  - `priority`: Automatic depth-based priority calculation (or custom function)
  - `changeFreq`: Set change frequency per route
  - `additionalSitemaps`: Include custom sitemaps in the sitemap index
