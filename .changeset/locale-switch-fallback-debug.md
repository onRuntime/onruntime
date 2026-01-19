---
"@onruntime/translations": minor
---

Add locale switching, fallback system, and debug mode

- **Locale switching**: The `Link` component now updates the locale cookie when navigating with a different `locale` prop, fixing the issue where clicking a locale switch link would redirect back to the previous locale
- **Fallback system**: Added key-level fallback to the default locale when a translation key is missing. This ensures users never see raw translation keys even if some translations are incomplete
- **Debug mode**: Added `debug` prop to providers that logs warnings to the console when translations are missing
- **Configurable cookie name**: Added `localeCookie` prop to all providers (defaults to `NEXT_LOCALE`)
- **Centralized constants**: Added `DEFAULT_LOCALE` and `DEFAULT_LOCALE_COOKIE` exports from core
