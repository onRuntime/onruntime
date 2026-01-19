"use client";

import NextLink from "next/link";
import type { ComponentProps, MouseEvent } from "react";

import { useTranslationContext } from "../../react/hooks/use-translation-context";

export type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Link component that automatically prefixes href with the current locale.
 * For the default locale, no prefix is added (Pages Router behavior).
 */
export const Link = ({ href, locale, onClick, ...props }: LinkProps) => {
  const { locale: currentLocale, defaultLocale, localeCookie } = useTranslationContext();

  const targetLocale = locale ?? currentLocale;
  const isLocaleChange = locale !== undefined && locale !== currentLocale;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Update cookie before navigation if locale is changing
    if (isLocaleChange) {
      const isSecure = window.location.protocol === "https:";
      document.cookie = `${localeCookie}=${targetLocale};path=/;max-age=31536000;SameSite=Lax${isSecure ? ";Secure" : ""}`;
    }
    onClick?.(e);
  };

  // Handle string href
  if (typeof href === "string") {
    // If href is external or a protocol link (mailto:, tel:, etc.), use as-is
    if (
      href.startsWith("http") ||
      href.startsWith("//") ||
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
    ) {
      return <NextLink href={href} onClick={handleClick} {...props} />;
    }

    // For default locale, don't add prefix (Pages Router behavior)
    if (targetLocale === defaultLocale) {
      const cleanHref = href.startsWith("/") ? href : `/${href}`;
      return <NextLink href={cleanHref} onClick={handleClick} {...props} />;
    }

    // For non-default locales, prefix with locale
    const localizedHref = href.startsWith("/")
      ? `/${targetLocale}${href}`
      : `/${targetLocale}/${href}`;

    return <NextLink href={localizedHref} onClick={handleClick} {...props} />;
  }

  // Handle UrlObject href
  const pathname = href.pathname ?? "/";

  // For default locale, don't add prefix
  if (targetLocale === defaultLocale) {
    return <NextLink href={href} onClick={handleClick} {...props} />;
  }

  // For non-default locales, prefix pathname with locale
  const localizedHref = {
    ...href,
    pathname: pathname.startsWith("/")
      ? `/${targetLocale}${pathname}`
      : `/${targetLocale}/${pathname}`,
  };

  return <NextLink href={localizedHref} onClick={handleClick} {...props} />;
};
