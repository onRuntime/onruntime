import type { TranslationVariables } from "./types";

/**
 * The ICU subset this library understands: `plural` and `select`.
 *
 * A subset rather than `intl-messageformat` because those two cover what a
 * translated interface needs, and the full library is ~30 kB in a client
 * bundle. Dates and numbers are better formatted with `Intl` at the call site.
 *
 * ICU's spelling rather than our own because translation platforms already read
 * it, translators know it, and a model writing a translation has seen millions
 * of examples. A private syntax would be understood here and nowhere else.
 *
 * Adding it breaks nothing: plain interpolation matches `{name}` on word
 * characters only, so every form below contains a comma and was inert before.
 */

/** Where a `{` … `}` ends, allowing for nested arguments inside it. */
const matchBrace = (input: string, open: number): number => {
  let depth = 0;
  for (let i = open; i < input.length; i++) {
    if (input[i] === "{") depth++;
    else if (input[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

type Branches = { keyword: string; branches: Map<string, string> };

/**
 * Split `count, plural, one {…} other {…}` into its parts.
 *
 * Returns null for anything that is not an argument this understands, which is
 * how `{name}` and an unrecognised keyword both fall through to the caller.
 */
const parseArgument = (body: string): (Branches & { name: string }) | null => {
  const firstComma = body.indexOf(",");
  if (firstComma === -1) return null;
  const secondComma = body.indexOf(",", firstComma + 1);
  if (secondComma === -1) return null;

  const name = body.slice(0, firstComma).trim();
  const keyword = body.slice(firstComma + 1, secondComma).trim();
  if (!name || (keyword !== "plural" && keyword !== "select")) return null;

  const branches = new Map<string, string>();
  let cursor = secondComma + 1;
  while (cursor < body.length) {
    const open = body.indexOf("{", cursor);
    if (open === -1) break;
    const selector = body.slice(cursor, open).trim();
    const close = matchBrace(body, open);
    if (close === -1) return null;
    if (selector) branches.set(selector, body.slice(open + 1, close));
    cursor = close + 1;
  }

  return branches.size > 0 ? { name, keyword, branches } : null;
};

/**
 * Which branch a `plural` argument takes.
 *
 * `=0` and friends are exact matches and win over a category, which is how ICU
 * lets a language say "no messages" without claiming it is the zero category.
 * The category itself comes from `Intl.PluralRules`, so the answer is CLDR's
 * rather than ours: Polish alone needs `one`, `few` and `many` (1, 3, 5), and
 * Arabic needs six.
 *
 * A locale is only ever passed to `Intl.PluralRules` here; an invalid tag
 * throws, so it falls back to the plain plural split rather than taking the
 * whole render down with it.
 */
const pluralBranch = (
  value: number,
  branches: Map<string, string>,
  locale: string | undefined,
): string | undefined => {
  const exact = branches.get(`=${value}`);
  if (exact !== undefined) return exact;

  let category: string;
  try {
    category = new Intl.PluralRules(locale).select(value);
  } catch {
    category = value === 1 ? "one" : "other";
  }
  return branches.get(category) ?? branches.get("other");
};

/**
 * Fill `{name}` and the `plural` / `select` arguments in one pass.
 *
 * An unknown variable is left as it was written. That is deliberate and
 * predates this file: a sentence with a visible `{name}` is a bug someone
 * reports, where a silently empty one reads as finished prose.
 */
export const formatMessage = (
  input: string,
  variables?: TranslationVariables,
  locale?: string,
): string => {
  if (!input.includes("{")) return input;

  let out = "";
  let cursor = 0;

  while (cursor < input.length) {
    const open = input.indexOf("{", cursor);
    if (open === -1) {
      out += input.slice(cursor);
      break;
    }
    out += input.slice(cursor, open);

    const close = matchBrace(input, open);
    if (close === -1) {
      // Unbalanced from here on: emit the rest as written rather than guess.
      out += input.slice(open);
      break;
    }

    const body = input.slice(open + 1, close);
    const argument = parseArgument(body);

    if (!argument) {
      // A simple `{name}`, or something this does not understand. Either way
      // the old behaviour applies.
      const name = body.trim();
      const value = variables?.[name];
      out += value === undefined ? `{${body}}` : String(value);
      cursor = close + 1;
      continue;
    }

    const { name, keyword, branches } = argument;
    const value = variables?.[name];

    if (value === undefined) {
      out += `{${body}}`;
      cursor = close + 1;
      continue;
    }

    let chosen: string | undefined;
    if (keyword === "plural") {
      const numeric = typeof value === "number" ? value : Number(value);
      chosen = Number.isNaN(numeric)
        ? branches.get("other")
        : pluralBranch(numeric, branches, locale);
    } else {
      chosen = branches.get(String(value)) ?? branches.get("other");
    }

    if (chosen === undefined) {
      out += `{${body}}`;
      cursor = close + 1;
      continue;
    }

    // `#` stands for the value the branch was chosen by, which is what lets one
    // branch read "# battles" instead of repeating the placeholder.
    const filled =
      keyword === "plural" ? chosen.split("#").join(String(value)) : chosen;

    // Branches nest: a `select` may hold a `plural`, and either may hold a
    // plain `{name}`.
    out += formatMessage(filled, variables, locale);
    cursor = close + 1;
  }

  return out;
};
