import { DEFAULT_LOCALE_COOKIE } from "@onruntime/translations";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { localeCodes, defaultLocale, getPreferredLocale } from "@/lib/translations";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameLocale = localeCodes.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  const isSecure = request.url.startsWith("https://");

  // If URL has the default locale prefix, redirect to remove it and set cookie
  if (pathnameLocale === defaultLocale) {
    const newPathname = pathname.slice(`/${defaultLocale}`.length) || "/";
    const response = NextResponse.redirect(new URL(newPathname, request.url));
    response.cookies.set(DEFAULT_LOCALE_COOKIE, defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: isSecure,
      sameSite: "lax",
    });
    return response;
  }

  // If URL has a non-default locale prefix, use it and persist preference
  if (pathnameLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", pathnameLocale);
    requestHeaders.set("x-pathname", pathname);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.cookies.set(DEFAULT_LOCALE_COOKIE, pathnameLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: isSecure,
      sameSite: "lax",
    });
    return response;
  }

  // No locale in URL - detect from Accept-Language
  const preferredLocale = getPreferredLocale(request);

  // If preferred locale is not the default, redirect to it
  if (preferredLocale !== defaultLocale) {
    return NextResponse.redirect(
      new URL(`/${preferredLocale}${pathname}`, request.url),
    );
  }

  // Use default locale (rewrite internally)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", defaultLocale);
  requestHeaders.set("x-pathname", pathname);
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(request.nextUrl, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  // `plugins` is excluded so the non-localized Claude Code marketplace route
  // (src/app/plugins/route.ts) isn't rewritten under /[locale].
  matcher: ["/((?!_next|favicon.ico|api|plugins|.*\\.).*)"],
};
