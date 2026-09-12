import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";
import {
  getAllJsonFiles,
  getKeys,
  LOCALES_DIR,
  SOURCE_LOCALE,
  targetLocales,
} from ".";

// Extracts the variables a message depends on: plain {name}, and the argument
// name of an ICU {count, plural, ...} or {gender, select, ...} together with
// whatever the branches themselves interpolate.
//
// A flat /\{[^}]+\}/ cannot do this: it stops at the first closing brace, so an
// ICU message yields "{count, plural, one {# battle}" and the same sentence in
// another language yields its own translated fragment. The two never match and
// every ICU key reads as a lost variable.
//
// A branch's CONTENT is prose, not a variable, so the walk descends into it
// rather than counting it: the branches differ between languages by design, and
// a language may have three of them where English has two.
function extractVariables(text: string): string[] {
  const found: string[] = [];

  const closingBrace = (input: string, open: number): number => {
    let depth = 0;
    for (let i = open; i < input.length; i++) {
      if (input[i] === "{") depth++;
      else if (input[i] === "}" && --depth === 0) return i;
    }
    return -1;
  };

  const walk = (input: string) => {
    let cursor = 0;
    while (cursor < input.length) {
      const open = input.indexOf("{", cursor);
      if (open === -1) return;
      const close = closingBrace(input, open);
      if (close === -1) return;

      const body = input.slice(open + 1, close);
      const firstComma = body.indexOf(",");
      const secondComma =
        firstComma === -1 ? -1 : body.indexOf(",", firstComma + 1);
      const keyword =
        secondComma === -1
          ? undefined
          : body.slice(firstComma + 1, secondComma).trim();

      if (keyword === "plural" || keyword === "select") {
        found.push(`{${body.slice(0, firstComma).trim()}}`);
        // Each branch is `selector {content}`; only the content is walked.
        let scan = secondComma + 1;
        while (scan < body.length) {
          const branchOpen = body.indexOf("{", scan);
          if (branchOpen === -1) break;
          const branchClose = closingBrace(body, branchOpen);
          if (branchClose === -1) break;
          walk(body.slice(branchOpen + 1, branchClose));
          scan = branchClose + 1;
        }
      } else {
        found.push(`{${body.trim()}}`);
      }

      cursor = close + 1;
    }
  };

  walk(text);
  return found.sort();
}

// Extracts HTML-like tags
function extractTags(text: string): string[] {
  const matches = text.match(/<[^>]+>/g);
  return matches ? matches.sort() : [];
}

// Gets a nested value from an object using dot notation
function getNestedValue(
  obj: Record<string, unknown>,
  key: string
): string | undefined {
  const parts = key.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function qualityTests() {
  const sourceLocaleDir = path.join(LOCALES_DIR, SOURCE_LOCALE);
  const sourceJsonFiles = getAllJsonFiles(sourceLocaleDir);

  describe("Locales quality", () => {
    test("variables are preserved in translations", () => {
      const issues: string[] = [];

      for (const file of sourceJsonFiles) {
        const sourcePath = path.join(sourceLocaleDir, file);
        const sourceData = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));
        const sourceKeys = getKeys(sourceData);

        for (const locale of targetLocales) {
          const targetPath = path.join(LOCALES_DIR, locale, file);
          if (!fs.existsSync(targetPath)) continue;

          const targetData = JSON.parse(fs.readFileSync(targetPath, "utf-8"));

          for (const key of sourceKeys) {
            const sourceValue = getNestedValue(sourceData, key);
            const targetValue = getNestedValue(targetData, key);

            if (!sourceValue || !targetValue) continue;

            const sourceVars = extractVariables(sourceValue);
            const targetVars = extractVariables(targetValue);

            if (sourceVars.length > 0) {
              const missingVars = sourceVars.filter(
                (v) => !targetVars.includes(v)
              );
              const extraVars = targetVars.filter(
                (v) => !sourceVars.includes(v)
              );

              if (missingVars.length > 0) {
                issues.push(
                  `${locale}/${file}: "${key}" missing variables: ${missingVars.join(", ")}`
                );
              }
              if (extraVars.length > 0) {
                issues.push(
                  `${locale}/${file}: "${key}" extra variables: ${extraVars.join(", ")}`
                );
              }
            }
          }
        }
      }

      assert.strictEqual(
        issues.length,
        0,
        `Variable preservation issues:\n${issues.join("\n")}`
      );
    });

    // The extractor above is the one piece of logic in this file, and getting it
    // wrong is silent: it would either pass every ICU message or fail all of
    // them. These pin its contract on literals rather than on the tree.
    test("variable extraction understands ICU arguments", () => {
      const same = (a: string, b: string) =>
        JSON.stringify(extractVariables(a)) ===
        JSON.stringify(extractVariables(b));

      // The same message in two languages agrees, even when one of them needs
      // more plural branches than the other.
      assert.ok(
        same(
          "{count, plural, one {# battle} other {# battles}}",
          "{count, plural, one {# bitwa} few {# bitwy} many {# bitew} other {# bitwy}}",
        ),
        "ICU plural should compare equal across languages",
      );
      assert.ok(
        same(
          "{g, select, m {of the {tank}} other {of {tank}}}",
          "{g, select, m {du {tank}} other {de {tank}}}",
        ),
        "ICU select should compare equal across languages",
      );

      // Plain interpolation is unchanged, in any order.
      assert.ok(same("{a} and {b}", "{b} et {a}"));

      // A genuinely lost variable is still caught, including inside a branch.
      assert.ok(!same("Hello {name}", "Bonjour"));
      assert.ok(
        !same("{n, plural, other {# of {total}}}", "{n, plural, other {#}}"),
        "a variable dropped inside a branch should still be caught",
      );

      assert.deepStrictEqual(
        extractVariables("{count, plural, one {# x} other {# xs}}"),
        ["{count}"],
      );
    });

    test("HTML tags are preserved in translations", () => {
      const issues: string[] = [];

      for (const file of sourceJsonFiles) {
        const sourcePath = path.join(sourceLocaleDir, file);
        const sourceData = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));
        const sourceKeys = getKeys(sourceData);

        for (const locale of targetLocales) {
          const targetPath = path.join(LOCALES_DIR, locale, file);
          if (!fs.existsSync(targetPath)) continue;

          const targetData = JSON.parse(fs.readFileSync(targetPath, "utf-8"));

          for (const key of sourceKeys) {
            const sourceValue = getNestedValue(sourceData, key);
            const targetValue = getNestedValue(targetData, key);

            if (!sourceValue || !targetValue) continue;

            const sourceTags = extractTags(sourceValue);
            const targetTags = extractTags(targetValue);

            if (sourceTags.length > 0) {
              const missingTags = sourceTags.filter(
                (t) => !targetTags.includes(t)
              );

              if (missingTags.length > 0) {
                issues.push(
                  `${locale}/${file}: "${key}" missing tags: ${missingTags.join(", ")}`
                );
              }
            }
          }
        }
      }

      assert.strictEqual(
        issues.length,
        0,
        `HTML tag preservation issues:\n${issues.join("\n")}`
      );
    });
  });
}
