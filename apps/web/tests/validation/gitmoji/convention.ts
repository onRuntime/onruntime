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
        const output = execFileSync("node", [VALIDATOR, "--message", example], {
          encoding: "utf8",
        });
        if (output.trim() === "") continue;

        const { permissionDecisionReason } =
          JSON.parse(output).hookSpecificOutput;
        const problems = /What is wrong:\n([\s\S]*?)\n\n/.exec(
          permissionDecisionReason,
        );
        refused.push(`${example}\n${problems?.[1] ?? permissionDecisionReason}`);
      }

      assert.deepStrictEqual(
        refused,
        [],
        `convention.json shows examples its own hook refuses:\n${refused.join("\n")}`,
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
    });
  });
}
