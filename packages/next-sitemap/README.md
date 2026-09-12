# @onruntime/next-sitemap

Dynamic sitemap generation for Next.js with automatic route discovery.

**[Documentation](https://onruntime.com/docs/next-sitemap)**

## Example

- [Next.js App Router](https://github.com/onRuntime/onruntime/tree/master/examples/next-sitemap/app)
- [Next.js App Router with i18n](https://github.com/onRuntime/onruntime/tree/master/examples/next-sitemap/app-with-locales)
- [Next.js Pages Router](https://github.com/onRuntime/onruntime/tree/master/examples/next-sitemap/pages)
- [Next.js Pages Router with i18n](https://github.com/onRuntime/onruntime/tree/master/examples/next-sitemap/pages-with-locales)

## Used by

- [onruntime.com](https://onruntime.com/sitemap.xml) - Creative development studio
- [trendstack.news](https://trendstack.news/sitemap.xml) - News site
- [tonightpass.com](https://tonightpass.com/sitemap.xml) - Nightlife platform
- [analayer.com](https://analayer.com/sitemap.xml) - Google Analytics enhancement

Want to be listed here? Open a PR! Just make sure `poweredBy` is enabled (default).

## Features

- **App Router** and **Pages Router** support
- Automatic route discovery using filesystem scan
- Calls `generateStaticParams` (App Router) or `getStaticPaths` (Pages Router) for dynamic routes
- Multi-sitemap support with sitemap index (for sites with >50,000 URLs)
- hreflang alternates for i18n
- Fully static generation (SSG)
- robots.txt generation with Next.js `MetadataRoute.Robots` compatibility

## Installation

```bash
pnpm add @onruntime/next-sitemap
```

## Usage

### Next.js App Router

#### 1. Create the sitemap index route

```typescript
// app/sitemap.xml/route.ts
import { createSitemapIndexHandler } from "@onruntime/next-sitemap/app";

export const dynamic = "force-static";

const { GET } = createSitemapIndexHandler({
  baseUrl: "https://example.com",
});

export { GET };
```

#### 2. Create the individual sitemap route

```typescript
// app/sitemap.xml/[id]/route.ts
import { createSitemapHandler } from "@onruntime/next-sitemap/app";

export const dynamic = "force-static";

const { generateStaticParams, GET } = createSitemapHandler({
  baseUrl: "https://example.com",
});

export { generateStaticParams, GET };
```

#### With i18n (optional)

If your app uses a `[locale]` segment for internationalization, just add `locales` and `defaultLocale`. The `localeSegment` is automatically set to `"[locale]"`:

```typescript
// app/sitemap.xml/route.ts
const { GET } = createSitemapIndexHandler({
  baseUrl: "https://example.com",
  locales: ["en", "fr"],
  defaultLocale: "en",
});
```

If you use a different segment name (e.g., `[lang]`), specify it explicitly:

```typescript
localeSegment: "[lang]", // Custom segment name
```

#### 3. Add URL rewrite in next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/sitemap-:id.xml",
        destination: "/sitemap.xml/:id",
      },
    ];
  },
};

export default nextConfig;
```

### Next.js Pages Router

#### 1. Create the sitemap index API route

```typescript
// pages/api/sitemap.xml.ts
import { createSitemapIndexApiHandler } from "@onruntime/next-sitemap/pages";

export default createSitemapIndexApiHandler({
  baseUrl: "https://example.com",
});
```

#### 2. Create the individual sitemap API route

```typescript
// pages/api/sitemap/[id].ts
import { createSitemapApiHandler } from "@onruntime/next-sitemap/pages";

export default createSitemapApiHandler({
  baseUrl: "https://example.com",
});
```

#### 3. Add URL rewrite in next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap.xml",
      },
      {
        source: "/sitemap-:id.xml",
        destination: "/api/sitemap/:id",
      },
    ];
  },
};

export default nextConfig;
```

#### With i18n (optional)

The Pages Router uses Next.js native i18n config in `next.config.js`. Pages stay in `pages/` (no `[locale]` folder), and you just need to provide `locales` and `defaultLocale`:

```typescript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
}

// pages/api/sitemap.xml.ts
import { createSitemapIndexApiHandler } from "@onruntime/next-sitemap/pages";

export default createSitemapIndexApiHandler({
  baseUrl: "https://example.com",
  locales: ["en", "fr"],
  defaultLocale: "en",
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | required | Base URL of the site |
| `appDirectory` | `string` | auto | (App Router) Path to scan for pages. Auto-detects `src/app` or `app` |
| `pagesDirectory` | `string` | auto | (Pages Router) Path to scan for pages. Auto-detects `src/pages` or `pages` |
| `locales` | `string[]` | `[]` | List of supported locales |
| `defaultLocale` | `string` | `undefined` | Default locale (URLs without prefix) |
| `urlsPerSitemap` | `number` | `5000` | Max URLs per sitemap file |
| `localeSegment` | `string` | auto | Auto-detected as `"[locale]"` when i18n is configured. Override for custom names like `"[lang]"`. |
| `exclude` | `string[]` or `function` | `undefined` | Patterns or function to exclude routes |
| `priority` | `number`, `"auto"`, or `function` | `"auto"` | Priority calculation (auto = depth-based) |
| `changeFreq` | `ChangeFrequency` or `function` | `"weekly"` | Change frequency for entries |
| `additionalSitemaps` | `string[]` | `[]` | Additional sitemaps to include in index |
| `debug` | `boolean` | `false` | Enable debug logging to diagnose route discovery issues |
| `poweredBy` | `boolean` | `true` | Include "Powered by @onruntime/next-sitemap" comment in XML |

#### Exclude Routes

Exclude specific routes from the sitemap using glob patterns or a function:

```typescript
// Using glob patterns
const { GET } = createSitemapIndexHandler({
  baseUrl: "https://example.com",
  exclude: ["/admin/*", "/api/*", "/private/**"],
});

// Using a function
const { GET } = createSitemapIndexHandler({
  baseUrl: "https://example.com",
  exclude: (path) => path.startsWith("/internal"),
});
```

#### Priority

By default, priority is calculated automatically based on URL depth:
- `/` → 1.0
- `/about` → 0.8
- `/blog/post` → 0.6
- Minimum: 0.1

You can override with a fixed value or a function:

```typescript
// Fixed priority for all URLs
priority: 0.8,

// Custom function
priority: (path) => {
  if (path === "/") return 1.0;
  if (path.startsWith("/products")) return 0.9;
  return 0.5;
},
```

#### Change Frequency

Set a default change frequency or customize per route:

```typescript
// Fixed value
changeFreq: "daily",

// Custom function
changeFreq: (path) => {
  if (path === "/") return "daily";
  if (path.startsWith("/blog")) return "weekly";
  return "monthly";
},
```

#### Additional Sitemaps

Include custom sitemaps in the sitemap index (e.g., for API-fetched data):

```typescript
const { GET } = createSitemapIndexHandler({
  baseUrl: "https://example.com",
  additionalSitemaps: ["/products-sitemap.xml", "/blog-sitemap.xml"],
});
```

### How It Works

1. The filesystem is scanned to discover all pages in your app/pages directory
2. For each page found, it extracts the route path
3. For dynamic routes (e.g., `/projects/[id]`), it calls `generateStaticParams` (App Router) or `getStaticPaths` (Pages Router)
4. URLs are paginated into multiple sitemaps (default: 5000 URLs each)
5. A sitemap index lists all individual sitemaps

### Generated URLs

For a route structure like:
```
app/
├── page.tsx                    → /
├── about/page.tsx              → /about
├── posts/page.tsx              → /posts
└── posts/[slug]/page.tsx       → /posts/hello-world, /posts/getting-started, ...
```

The sitemap will include:
- All static routes
- All dynamic routes resolved via `generateStaticParams`
- hreflang alternates for each locale (if i18n is configured)

**Note:** Dynamic routes without `generateStaticParams` are skipped. If you need to include routes that fetch data at runtime (e.g., from an API), you can create a separate sitemap using [Next.js native sitemap generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap):

```typescript
// app/custom-sitemap.xml/route.ts
import { generateSitemapXml } from "@onruntime/next-sitemap";

export async function GET() {
  // Fetch your dynamic data
  const products = await fetch("https://api.example.com/products").then(r => r.json());

  const entries = products.map((p: { slug: string }) => ({
    url: `https://example.com/products/${p.slug}`,
    lastModified: new Date(),
  }));

  return new Response(generateSitemapXml(entries), {
    headers: { "Content-Type": "application/xml" },
  });
}
```

### Example Output

**Sitemap Index** (`/sitemap.xml`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Powered by @onruntime/next-sitemap -->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-0.xml</loc>
    <lastmod>2024-01-01T00:00:00.000Z</lastmod>
  </sitemap>
</sitemapindex>
```

**Individual Sitemap** (`/sitemap-0.xml`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Powered by @onruntime/next-sitemap -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-01T00:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://example.com/posts/hello-world</loc>
    <lastmod>2024-01-01T00:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

## Robots.txt (Pages Router)

For Pages Router, use `createRobotsApiHandler` to generate a `robots.txt` file. The configuration uses the same format as [Next.js `MetadataRoute.Robots`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots).

```typescript
// pages/api/robots.txt.ts
import { createRobotsApiHandler } from "@onruntime/next-sitemap/pages";

export default createRobotsApiHandler({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/admin", "/private"],
  },
  sitemap: "https://example.com/sitemap.xml",
  // poweredBy: false, // Disable "Powered by" comment
});
```

Add a rewrite in `next.config.ts`:

```typescript
{
  source: "/robots.txt",
  destination: "/api/robots.txt",
}
```

**Note:** For App Router, use the [native `robots.ts` file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) instead.

## Requirements

This package requires a **Node.js server runtime**. It works with:
- Vercel
- Netlify (with Next.js runtime)
- Railway, Render, Fly.io
- AWS (EC2, ECS, Lambda)
- Docker containers
- Any Node.js server

It does **not** work with static exports (`output: 'export'`) or static hosting platforms like Cloudflare Pages, Netlify (static mode), or GitHub Pages.

## Troubleshooting

### Dynamic routes not included in sitemap

If your dynamic routes (e.g., `/articles/[slug]`) are not appearing in the sitemap, enable debug mode to diagnose:

```typescript
const { GET } = createSitemapIndexHandler({
  baseUrl: "https://example.com",
  debug: true, // Enable debug logging
});
```

This will log:
- All discovered routes and whether `generateStaticParams` was found
- Number of params returned by each `generateStaticParams` call
- Any errors that occur during param generation

**Common issues:**

1. **`generateStaticParams`/`getStaticPaths` not detected**: Make sure it's exported at the top level of your page file:
   ```typescript
   // ✅ Correct (App Router)
   export async function generateStaticParams() { ... }

   // ✅ Correct (Pages Router)
   export async function getStaticPaths() { ... }

   // ❌ Wrong - not exported
   async function generateStaticParams() { ... }
   ```

2. **Database/API errors**: If `generateStaticParams` fetches data from a database or API, errors are caught and logged. Check the console for error messages.

3. **Empty params returned**: If `generateStaticParams` returns an empty array, no dynamic paths will be generated.

### Recommended approach for API/Database routes

For routes that fetch data from external sources (APIs, databases like Payload CMS), we recommend using `additionalSitemaps` with a custom sitemap route:

```typescript
// app/sitemap.xml/route.ts
const { GET } = createSitemapIndexHandler({
  baseUrl: "https://example.com",
  additionalSitemaps: ["/articles-sitemap.xml"],
});

// app/articles-sitemap.xml/route.ts
import { generateSitemapXml } from "@onruntime/next-sitemap";
import { getPayload } from "payload";

export async function GET() {
  const payload = await getPayload({ config: configPromise });
  const articles = await payload.find({
    collection: "articles",
    limit: 1000,
    select: { slug: true, updatedAt: true },
  });

  const entries = articles.docs.map((article) => ({
    url: `https://example.com/articles/${article.slug}`,
    lastModified: article.updatedAt,
    priority: 0.7,
  }));

  return new Response(generateSitemapXml(entries), {
    headers: { "Content-Type": "application/xml" },
  });
}
```

This approach gives you full control over data fetching and error handling.

## License

MIT
