# @onruntime/translations

Lightweight i18n library for React, Next.js, and React Native.

## Examples

- [Next.js App Router](https://github.com/onRuntime/onruntime/tree/master/examples/translations/next-app)
- [Next.js Pages Router](https://github.com/onRuntime/onruntime/tree/master/examples/translations/next-pages)
- [React + Vite](https://github.com/onRuntime/onruntime/tree/master/examples/translations/react)

## Installation

```bash
pnpm add @onruntime/translations
```

## Usage

### Next.js App Router

#### 1. Create your config

```typescript
// lib/translations.ts
import {
  createGetPreferredLocale,
  DEFAULT_LOCALE_COOKIE,
  DEFAULT_LOCALES_DIR,
} from "@onruntime/translations";

export const locales = ["en", "fr"];
export const defaultLocale = locales[0];
export const LOCALE_COOKIE = DEFAULT_LOCALE_COOKIE; // "NEXT_LOCALE"
export const localesDir = DEFAULT_LOCALES_DIR; // "locales"

export const getPreferredLocale = createGetPreferredLocale({ locales });
```

#### 2. Create server translation helper

```typescript
// lib/translations.server.ts
import { createGetTranslation } from "@onruntime/translations/next/server";

export const getTranslation = createGetTranslation({
  debug: process.env.NODE_ENV === "development",
});
```

#### 3. Setup proxy middleware

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { locales, defaultLocale, LOCALE_COOKIE, getPreferredLocale } from "@/lib/translations";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  const isSecure = request.url.startsWith("https://");

  if (pathnameLocale === defaultLocale) {
    const newPathname = pathname.slice(`/${defaultLocale}`.length) || "/";
    const response = NextResponse.redirect(new URL(newPathname, request.url));
    response.cookies.set(LOCALE_COOKIE, defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: isSecure,
      sameSite: "lax",
    });
    return response;
  }

  if (pathnameLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", pathnameLocale);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set(LOCALE_COOKIE, pathnameLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: isSecure,
      sameSite: "lax",
    });
    return response;
  }

  const preferredLocale = getPreferredLocale(request);

  if (preferredLocale !== defaultLocale) {
    return NextResponse.redirect(new URL(`/${preferredLocale}${pathname}`, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", defaultLocale);
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(request.nextUrl, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\.).*)"],
};
```

#### 4. Setup providers

```typescript
// app/[lang]/providers.tsx
"use client";

import type { ReactNode } from "react";

import { AppTranslationProvider } from "@onruntime/translations/next";

import { locales, defaultLocale, LOCALE_COOKIE } from "@/lib/translations";

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
      defaultLocale={defaultLocale}
      localeCookie={LOCALE_COOKIE}
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
```

#### 5. Setup layout

```typescript
// app/[lang]/layout.tsx
import type { ReactNode } from "react";

import { locales } from "@/lib/translations";

import { Providers } from "./providers";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body>
        <Providers locale={lang}>{children}</Providers>
      </body>
    </html>
  );
}
```

#### 6. Use in Server Components

```typescript
// app/[lang]/page.tsx
import { Link } from "@onruntime/translations/next";

import { getTranslation } from "@/lib/translations.server";

export default async function Home() {
  const { t, locale } = await getTranslation();
  const otherLocale = locale === "en" ? "fr" : "en";

  return (
    <div>
      <h1>{t("greeting", { name: "John" })}</h1>
      <Link href="/about">{t("nav.about")}</Link>

      {/* Switch locale */}
      <Link href="/" locale={otherLocale}>
        {t("actions.switch")}
      </Link>
    </div>
  );
}
```

#### 7. Use in Client Components

```typescript
// app/[lang]/about/page.tsx
"use client";

import { useTranslation, useLocale } from "@onruntime/translations/react";
import { Link } from "@onruntime/translations/next";

export default function About() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  return (
    <div>
      <h1>{t("about.title")}</h1>
      <p>Current locale: {locale}</p>
      <Link href="/">{t("nav.home")}</Link>
    </div>
  );
}
```

### Next.js Pages Router

#### 1. Configure i18n in next.config.js

```javascript
// next.config.js
module.exports = {
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
  },
};
```

#### 2. Setup provider in _app.tsx

```typescript
// pages/_app.tsx
import type { AppProps } from "next/app";
import { TranslationProvider } from "@onruntime/translations/next";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TranslationProvider
      load={(locale, ns) => {
        try {
          return require(`@/locales/${locale}/${ns}.json`);
        } catch {
          return undefined;
        }
      }}
    >
      <Component {...pageProps} />
    </TranslationProvider>
  );
}
```

#### 3. Use in pages

```typescript
// pages/index.tsx
import Link from "next/link";
import { useTranslation } from "@onruntime/translations/react";

export default function Home() {
  const { t, locale } = useTranslation();

  return (
    <div>
      <h1>{t("greeting", { name: "John" })}</h1>
      <Link href="/about" locale="fr">
        Switch to French
      </Link>
    </div>
  );
}
```

### React + Vite

#### 1. Setup provider with Vite loader

```typescript
// src/app.tsx
import { TranslationProvider } from "@onruntime/translations/react";
import { createViteLoader } from "@onruntime/translations/vite";

const modules = import.meta.glob("./locales/**/*.json", { eager: true });
const load = createViteLoader(modules);

const App = () => {
  return (
    <TranslationProvider defaultLocale="en" locales={["en", "fr"]} load={load}>
      <Demo />
    </TranslationProvider>
  );
};

export default App;
```

#### 2. Use translations

```typescript
// src/components/demo.tsx
import { useTranslation, useLocale } from "@onruntime/translations/react";

export const Demo = () => {
  const { t, locale } = useTranslation();
  const { setLocale } = useLocale();

  return (
    <div>
      <h1>{t("greeting", { name: "John" })}</h1>
      <p>Current locale: {locale}</p>
      <button onClick={() => setLocale(locale === "en" ? "fr" : "en")}>
        Switch language
      </button>
    </div>
  );
};
```

### Translation files

```json
// locales/en/common.json
{
  "greeting": "Hello, {name}!",
  "nav": {
    "home": "Home",
    "about": "About"
  },
  "about": {
    "title": "About Us"
  }
}
```

## Debug Mode

Debug mode logs warnings when translations are missing:

```
[translations] Missing translation for key "greeting" in locale "fr", using fallback from "en"
[translations] Missing translation for key "unknown.key" in locale "fr" and fallback "en"
```

Set `debug: true` or `debug: false` in your provider/config to control this behavior (defaults to `true` in development).

## Fallback Behavior

The library automatically falls back to the default locale when a translation key is missing:

1. **Key-level fallback**: If a key exists in `en` but not in `fr`, the English translation is used
2. **File-level fallback**: If a locale file doesn't exist at all, the default locale file is loaded

This ensures your app never shows raw translation keys to users, even if some translations are incomplete.

## License

MIT
