import assert from "node:assert";
import test, { describe } from "node:test";
import { formatMessage } from "../src/core/message";

export function messageTests() {
  describe("formatMessage: plain interpolation", () => {
    test("fills a named variable", () => {
      assert.strictEqual(formatMessage("Hello {name}", { name: "Ada" }), "Hello Ada");
    });

    test("fills the same variable more than once", () => {
      assert.strictEqual(
        formatMessage("{a} and {a}", { a: "x" }),
        "x and x",
      );
    });

    test("numbers are stringified", () => {
      assert.strictEqual(formatMessage("{n} left", { n: 0 }), "0 left");
    });

    test("leaves an unknown variable visible", () => {
      // A visible `{name}` is a bug someone reports; an empty string reads as
      // finished prose and ships.
      assert.strictEqual(formatMessage("Hello {name}", {}), "Hello {name}");
      assert.strictEqual(formatMessage("Hello {name}"), "Hello {name}");
    });

    test("a string with no brace is returned as-is", () => {
      assert.strictEqual(formatMessage("nothing here", { a: 1 }), "nothing here");
    });
  });

  describe("formatMessage: plural", () => {
    const tanks =
      "{count, plural, one {# tank} other {# tanks}}";

    test("English one and other", () => {
      assert.strictEqual(formatMessage(tanks, { count: 1 }, "en"), "1 tank");
      assert.strictEqual(formatMessage(tanks, { count: 4 }, "en"), "4 tanks");
      assert.strictEqual(formatMessage(tanks, { count: 0 }, "en"), "0 tanks");
    });

    test("Polish needs three forms, and CLDR supplies them", () => {
      // The reason this whole file exists: a two-form split writes "3 bitew",
      // which is the 5+ form, on every count from two upwards.
      const pl =
        "{count, plural, one {# bitwa} few {# bitwy} many {# bitew} other {# bitwy}}";
      assert.strictEqual(formatMessage(pl, { count: 1 }, "pl"), "1 bitwa");
      assert.strictEqual(formatMessage(pl, { count: 3 }, "pl"), "3 bitwy");
      assert.strictEqual(formatMessage(pl, { count: 5 }, "pl"), "5 bitew");
      assert.strictEqual(formatMessage(pl, { count: 22 }, "pl"), "22 bitwy");
    });

    test("French counts one as singular at zero", () => {
      const fr = "{count, plural, one {# bataille} other {# batailles}}";
      assert.strictEqual(formatMessage(fr, { count: 0 }, "fr"), "0 bataille");
      assert.strictEqual(formatMessage(fr, { count: 1 }, "fr"), "1 bataille");
      assert.strictEqual(formatMessage(fr, { count: 2 }, "fr"), "2 batailles");
    });

    test("Arabic uses categories English does not have", () => {
      const ar =
        "{count, plural, zero {لا شيء} one {واحد} two {اثنان} few {قليل} many {كثير} other {آخر}}";
      assert.strictEqual(formatMessage(ar, { count: 0 }, "ar"), "لا شيء");
      assert.strictEqual(formatMessage(ar, { count: 2 }, "ar"), "اثنان");
      assert.strictEqual(formatMessage(ar, { count: 11 }, "ar"), "كثير");
    });

    test("an exact match wins over its category", () => {
      const m =
        "{count, plural, =0 {no messages} one {# message} other {# messages}}";
      assert.strictEqual(formatMessage(m, { count: 0 }, "en"), "no messages");
      assert.strictEqual(formatMessage(m, { count: 1 }, "en"), "1 message");
    });

    test("# is replaced by the value, and only inside a plural", () => {
      assert.strictEqual(
        formatMessage("{n, plural, other {# of #}}", { n: 7 }, "en"),
        "7 of 7",
      );
      assert.strictEqual(
        formatMessage("{n, select, other {# stays}}", { n: 7 }, "en"),
        "# stays",
      );
    });

    test("falls back to other when the category has no branch", () => {
      const m = "{count, plural, one {# thing} other {# things}}";
      // `few` is what Polish selects for 3; the message does not offer it.
      assert.strictEqual(formatMessage(m, { count: 3 }, "pl"), "3 things");
    });

    test("a numeric string is accepted", () => {
      const m = "{count, plural, one {# item} other {# items}}";
      assert.strictEqual(formatMessage(m, { count: "1" }, "en"), "1 item");
      assert.strictEqual(formatMessage(m, { count: "4" }, "en"), "4 items");
    });

    test("a non-numeric value takes other rather than throwing", () => {
      const m = "{count, plural, one {# item} other {# items}}";
      assert.strictEqual(formatMessage(m, { count: "many" }, "en"), "many items");
    });

    test("an unknown locale degrades instead of throwing", () => {
      const m = "{count, plural, one {# item} other {# items}}";
      assert.strictEqual(formatMessage(m, { count: 1 }, "not-a-locale"), "1 item");
      assert.strictEqual(formatMessage(m, { count: 5 }, "not-a-locale"), "5 items");
    });

    test("no locale at all still works", () => {
      const m = "{count, plural, one {# item} other {# items}}";
      assert.strictEqual(formatMessage(m, { count: 1 }), "1 item");
      assert.strictEqual(formatMessage(m, { count: 2 }), "2 items");
    });
  });

  describe("formatMessage: select", () => {
    const article =
      "Vidéos {gender, select, m {du} f {de la} elided {de l’} other {de}} {tank}";

    test("picks the named branch", () => {
      assert.strictEqual(
        formatMessage(article, { gender: "f", tank: "Panthère" }, "fr"),
        "Vidéos de la Panthère",
      );
      assert.strictEqual(
        formatMessage(article, { gender: "elided", tank: "IS-7" }, "fr"),
        "Vidéos de l’ IS-7",
      );
    });

    test("an unlisted value takes other", () => {
      assert.strictEqual(
        formatMessage(article, { gender: "n", tank: "T-34" }, "fr"),
        "Vidéos de T-34",
      );
    });

    test("a select with no other and no match is left visible", () => {
      const m = "{g, select, m {le}}";
      assert.strictEqual(formatMessage(m, { g: "f" }), "{g, select, m {le}}");
    });
  });

  describe("formatMessage: nesting and edge cases", () => {
    test("a variable inside a branch is filled", () => {
      const m = "{count, plural, one {one {thing}} other {many {thing}s}}";
      assert.strictEqual(
        formatMessage(m, { count: 1, thing: "tank" }, "en"),
        "one tank",
      );
      assert.strictEqual(
        formatMessage(m, { count: 3, thing: "tank" }, "en"),
        "many tanks",
      );
    });

    test("a plural nested inside a select", () => {
      const m =
        "{kind, select, tank {{count, plural, one {# tank} other {# tanks}}} other {{count} items}}";
      assert.strictEqual(
        formatMessage(m, { kind: "tank", count: 2 }, "en"),
        "2 tanks",
      );
      assert.strictEqual(
        formatMessage(m, { kind: "misc", count: 2 }, "en"),
        "2 items",
      );
    });

    test("a missing plural variable is left visible, like a plain one", () => {
      const m = "{count, plural, one {# tank} other {# tanks}}";
      assert.strictEqual(formatMessage(m, {}, "en"), m);
    });

    test("an unbalanced brace emits the rest as written", () => {
      assert.strictEqual(
        formatMessage("before {count, plural, one {x}", { count: 1 }),
        "before {count, plural, one {x}",
      );
    });

    test("text around an argument is preserved", () => {
      const m = "You have {n, plural, one {# tank} other {# tanks}} in stock.";
      assert.strictEqual(
        formatMessage(m, { n: 1 }, "en"),
        "You have 1 tank in stock.",
      );
    });

    test("two arguments in one string", () => {
      const m =
        "{a, plural, one {# cat} other {# cats}} and {b, plural, one {# dog} other {# dogs}}";
      assert.strictEqual(
        formatMessage(m, { a: 1, b: 2 }, "en"),
        "1 cat and 2 dogs",
      );
    });

    test("whitespace around the selector and keyword is tolerated", () => {
      const m = "{ count ,  plural ,  one {# x}  other {# xs} }";
      assert.strictEqual(formatMessage(m, { count: 1 }, "en"), "1 x");
    });

    test("an unknown keyword is treated as an unknown variable", () => {
      // Not silently dropped: the author sees their typo on the page.
      const m = "{count, plurl, one {# x} other {# xs}}";
      assert.strictEqual(formatMessage(m, { count: 1 }, "en"), m);
    });
  });

  describe("formatMessage: backward compatibility", () => {
    // Every one of these is what earlier versions produced, byte for byte.
    test("the old interpolation is unchanged", () => {
      const before = (str: string, vars: Record<string, string | number>) =>
        str.replace(
          /\{(\w+)\}/g,
          (_, name: string) => String(vars[name] ?? `{${name}}`),
        );
      const cases: [string, Record<string, string | number>][] = [
        ["Hello {name}", { name: "Ada" }],
        ["{a}{b}{c}", { a: 1, b: 2, c: 3 }],
        ["no vars here", { a: 1 }],
        ["{missing} stays", {}],
        ["{a} and {missing}", { a: "x" }],
        ["{x}", { x: 0 }],
      ];
      for (const [input, vars] of cases) {
        assert.strictEqual(
          formatMessage(input, vars),
          before(input, vars),
          `changed for ${JSON.stringify(input)}`,
        );
      }
    });

    test("a lone brace pair that is not a variable is left alone", () => {
      assert.strictEqual(formatMessage("{}", { a: 1 }), "{}");
    });
  });
}
