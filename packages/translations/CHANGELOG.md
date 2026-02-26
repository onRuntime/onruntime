# @onruntime/translations

## 0.2.0

### Minor Changes

- 2dd2428: Add server entry point, locale switching fix, fallback system, and debug mode

  - **New server entry point**: `@onruntime/translations/next/server` - Exports `createGetTranslation()` for server-side translations with automatic locale detection via `next/headers`
  - **Locale switching fix**: The `Link` component now updates the locale cookie when navigating with a different `locale` prop, fixing the issue where clicking a locale switch link would redirect back to the previous locale
  - **Fallback system**: Added key-level fallback to the default locale when a translation key is missing. This ensures users never see raw translation keys even if some translations are incomplete
  - **Debug mode**: Enabled by default in development. Logs warnings to the console when translations are missing. Can be disabled with `debug: false`
  - **Configurable cookie name**: Added `localeCookie` prop to all providers (defaults to `NEXT_LOCALE`)
  - **Centralized constants**: Added `DEFAULT_LOCALE` and `DEFAULT_LOCALE_COOKIE` exports from core
  - **Locale detection utility**: Added `createGetPreferredLocale()` to create a function that detects the user's preferred locale from cookies and Accept-Language header

## 0.1.1

### Patch Changes

- Fix Link component to support protocol-based URLs (mailto:, tel:, sms:, etc.) without adding locale prefix
