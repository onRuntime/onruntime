# Locales

Translation files for the onRuntime website.

> **Important**: Only add/modify translations in the `en/` folder. Other locales (`fr/`, `es/`, etc.) are **auto-generated** by CI when you push changes to the English files.

## Structure

The translation files mirror the `src/` structure:

```tree
locales/
├── en/
│   ├── common.json                    # Shared (buttons, errors, forms)
│   ├── layout/                        # → src/components/layout/
│   │   ├── footer.json
│   │   └── navbar.json
│   ├── app/                           # → src/app/[locale]/
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       └── page.json          # → src/app/[locale]/projects/[id]/page.tsx
│   │   └── careers/
│   │       └── [id]/
│   │           └── page.json          # → src/app/[locale]/careers/[id]/page.tsx
│   └── components/                    # → src/components/
│       └── marketing/
│           ├── projects/
│           │   └── sections.json
│           └── landing/
│               └── visitor/
│                   └── projects.json
└── fr/
    └── ...
```

The namespace used in `getTranslation()` or `useTranslation()` matches the path from `locales/{locale}/`.

## Usage

### Server Components

```tsx
import { getTranslation } from "@/lib/translations.server";

export default async function Page() {
  const { t } = await getTranslation("layout/footer");
  return <p>{t("tagline")}</p>;
}
```

### Client Components

```tsx
"use client";

import { useTranslation } from "@onruntime/translations/react";

export const Component = () => {
  const { t } = useTranslation("layout/footer");
  return <p>{t("tagline")}</p>;
};
```

### Dynamic Pages

```tsx
import { getTranslation } from "@/lib/translations.server";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getTranslation(`marketing/projects/${id}`);
  return <h1>{t("title")}</h1>;
}
```

## Adding a new namespace

1. Create `en/<path>/<namespace>.json` (only English!)
2. Push to `master` - CI will auto-generate translations for other locales
3. Use `getTranslation("<path>/<namespace>")` or `useTranslation("<path>/<namespace>")`

To generate all missing translations locally:
```bash
pnpm --filter @onruntime/web translate:init
```

## Conventions

- File names must be lowercase or kebab-case: `footer.json`, `privacy-policy.json`
- Never use kebab-case as prefix for grouping files: `hero.json` (not `hero-section.json`, `hero-modal.json`)
- Keys must be lowercase or kebab-case: `nav.home`, `privacy-policy`
- Never use kebab-case as prefix for grouping keys: `hero.title`, `hero.description` (not `hero-title`, `hero-description`)
- Use nested keys for grouping: `nav.home`, `links.contact`
- Keep keys in English: `greeting`, not `salutation`
- Use interpolation for dynamic values: `"Hello, {name}!"` (variables can be camelCase to match JS)
  ```tsx
  // In JSON: "greeting": "Hello, {name}!"
  t("greeting", { name: "John" }) // → "Hello, John!"
  ```
- Use a plural argument whenever a number decides the wording, never two keys:
  ```tsx
  // In JSON: "battles": "{count, plural, one {# battle} other {# battles}}"
  t("battles", { count: 1 }) // → "1 battle"
  t("battles", { count: 4 }) // → "4 battles"
  ```
  The branch is chosen by `Intl.PluralRules` in the locale being read, so a
  language writes the branches it needs: Polish `one`/`few`/`many`, Arabic six,
  Japanese only `other`. A hand-written `key` / `key-plural` pair cannot do that
  and writes the 5-and-above form on every count from two upwards. `#` stands
  for the count. Only the English file is written by hand; the generator is told
  to adjust the branches per language.
- Use a select argument when your data knows a grammatical attribute:
  `"{gender, select, m {...} f {...} other {...}}"`. It cannot be derived from
  the word, so pass it as a variable. For a dynamic proper noun, prefer a form
  that needs no article at all
- HTML is supported with `dangerouslySetInnerHTML`: `"Visit <strong>Paris</strong>"`
- Avoid title case in translations: `"Our services"` (not `"Our Services"`)
- Never use fallbacks in code: all translations must exist in all locale files
  ```tsx
  // ✅ Good - translation exists in all locales
  {t("metrics.dev-time.value")}

  // ❌ Bad - fallback masks missing translations
  {t("metrics.dev-time.value") || metric.value}
  ```
