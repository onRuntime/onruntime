import assert from "node:assert";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";
import {
  CONVENTION_FILE,
  type Convention,
  DOC_FILE,
  PLUGIN_DIR,
  SITE_MANIFEST,
  SOURCE_LOCALE,
  VALIDATOR,
} from ".";

// | `add` | Add a new feature |
const TYPE_ROW_PATTERN = /^\|\s*`([a-z]+)`\s*\|/gm;

// What the hook says is wrong with a message, or null when it lets it through.
function refusal(message: string): string | null {
  const output = execFileSync("node", [VALIDATOR, "--message", message], {
    encoding: "utf8",
  });
  if (output.trim() === "") return null;

  const { permissionDecisionReason } = JSON.parse(output).hookSpecificOutput;
  const problems = /What is wrong:\n([\s\S]*?)\n\n/.exec(
    permissionDecisionReason,
  );
  return problems?.[1] ?? permissionDecisionReason;
}

export function conventionTests() {
  const convention: Convention = JSON.parse(
    fs.readFileSync(CONVENTION_FILE, "utf8"),
  );

  describe("Gitmoji convention", () => {
    // The documentation and the plugin drifted once: `release` was added to the
    // plugin and never reached the docs. Only the type names are compared, not
    // their descriptions, and only the source locale, since the CI regenerates
    // the translations from it.
    test(`${SOURCE_LOCALE} documentation lists the same types as the plugin`, () => {
      const doc = fs.readFileSync(DOC_FILE, "utf8");
      const documented = [...doc.matchAll(TYPE_ROW_PATTERN)].map(
        (match) => match[1],
      );

      assert.deepStrictEqual(
        documented,
        convention.types.map((type) => type.name),
        `The types table in ${path.basename(DOC_FILE)} is out of sync with ` +
          `convention.json. Update the table, and let the CI regenerate the ` +
          `other locales.`,
      );
    });

    // The emoji reference page renders the `gitmojis` package and the hook
    // imports it, each from its own install. Different ranges would put emojis
    // on the page that the hook refuses, which is what reading `master` did.
    test("the site and the plugin depend on the same gitmojis range", () => {
      const read = (file: string) =>
        JSON.parse(fs.readFileSync(file, "utf8")).dependencies?.gitmojis;

      const site = read(SITE_MANIFEST);
      const plugin = read(path.join(PLUGIN_DIR, "package.json"));

      assert.strictEqual(
        site,
        plugin,
        `apps/web depends on gitmojis@${site} and the plugin on ` +
          `gitmojis@${plugin}. Raise both together.`,
      );
    });

    test("every example in convention.json passes the hook", () => {
      const refused: string[] = [];

      for (const example of convention.examples) {
        const problems = refusal(example);
        if (problems !== null) refused.push(`${example}\n${problems}`);
      }

      assert.deepStrictEqual(
        refused,
        [],
        `convention.json shows examples its own hook refuses:\n${refused.join("\n")}`,
      );
    });

    // A counter-example is the shortest way to show what the type-as-verb rule
    // asks for, so both halves of a pair have to behave: the left one refused,
    // the rewrite accepted. A pair that drifts teaches the wrong lesson, and it
    // is printed in every refusal the hook writes.
    test("every counter-example is refused and every rewrite passes", () => {
      const wrong: string[] = [];

      for (const pair of convention.counterExamples) {
        if (refusal(pair.wrong) === null) {
          wrong.push(`the hook allows "${pair.wrong}", shown as wrong`);
        }

        const problems = refusal(pair.right);
        if (problems !== null) {
          wrong.push(
            `the hook refuses "${pair.right}", shown as the rewrite:\n${problems}`,
          );
        }
      }

      assert.deepStrictEqual(wrong, [], `\n${wrong.join("\n")}`);
    });

    // The list is read into a Set and matched against a lowercased word, so an
    // entry carrying a capital, a space or a duplicate would never match and
    // would sit there looking enforced.
    test("the second verbs are single lowercase words, sorted and unique", () => {
      const verbs = convention.secondVerbs;

      assert.deepStrictEqual(
        verbs.filter((verb) => !/^[a-z]+$/.test(verb)),
        [],
        "a second verb is not a single lowercase word",
      );
      assert.deepStrictEqual(
        [...verbs].sort(),
        verbs,
        "the second verbs are not in alphabetical order",
      );
      assert.strictEqual(
        new Set(verbs).size,
        verbs.length,
        "the second verbs hold a duplicate",
      );
    });

    // Every rule the hook enforces has to be stated in prose too, or an agent
    // can only learn it by being refused. The footer rules in particular live
    // as regexes, which the skill never reads.
    test("the rules mention the footers the hook refuses", () => {
      const rules = convention.rules.join(" ").toLowerCase();

      assert.ok(
        rules.includes("co-authored-by"),
        "convention.json refuses agent footers but never says so in rules",
      );
      assert.ok(
        convention.forbiddenFooters.length > 0,
        "no forbidden footer is declared",
      );
      assert.ok(
        rules.includes("second verb"),
        "convention.json refuses a second verb but never says so in rules",
      );
    });
  });
}
