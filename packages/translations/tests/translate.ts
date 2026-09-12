import assert from "node:assert";
import test, { describe } from "node:test";
import { createTranslate } from "../src/core/translate";

/**
 * The message formatter reached through `t`, which is the only way an app uses
 * it. What these add over `message.ts` is the wiring: that the locale really
 * arrives from the options, that a nested key still formats, and that a string
 * served from the fallback dictionary is pluralised in the language the reader
 * is actually reading.
 */
export function translateTests() {
  describe("createTranslate: formatting", () => {
    const dictionary = {
      greeting: "Hello {name}",
      battles: "{count, plural, one {# battle} other {# battles}}",
      nested: { deep: "{count, plural, one {# item} other {# items}}" },
    };

    test("plain interpolation still works", () => {
      const t = createTranslate(dictionary, { locale: "en" });
      assert.strictEqual(t("greeting", { name: "Ada" }), "Hello Ada");
    });

    test("plural uses the configured locale", () => {
      const en = createTranslate(dictionary, { locale: "en" });
      assert.strictEqual(en("battles", { count: 1 }), "1 battle");
      assert.strictEqual(en("battles", { count: 3 }), "3 battles");
    });

    test("a nested key formats too", () => {
      const t = createTranslate(dictionary, { locale: "en" });
      assert.strictEqual(t("nested.deep", { count: 1 }), "1 item");
    });

    test("keySplit off treats the dotted key as one key", () => {
      const t = createTranslate(
        { "nested.deep": "{count, plural, one {# x} other {# xs}}" },
        { locale: "en", keySplit: false },
      );
      assert.strictEqual(t("nested.deep", { count: 2 }), "2 xs");
    });

    test("a missing key returns the key, as before", () => {
      const t = createTranslate(dictionary, { locale: "en" });
      assert.strictEqual(t("absent", { count: 1 }), "absent");
    });

    test("no variables leaves the message visible rather than blank", () => {
      const t = createTranslate(dictionary, { locale: "en" });
      assert.strictEqual(t("greeting"), "Hello {name}");
    });
  });

  describe("createTranslate: the locale really reaches the plural rules", () => {
    const dictionary = {
      battles:
        "{count, plural, one {# bitwa} few {# bitwy} many {# bitew} other {# bitwy}}",
    };

    test("Polish selects few and many where English would not", () => {
      const pl = createTranslate(dictionary, { locale: "pl" });
      assert.strictEqual(pl("battles", { count: 1 }), "1 bitwa");
      assert.strictEqual(pl("battles", { count: 3 }), "3 bitwy");
      assert.strictEqual(pl("battles", { count: 5 }), "5 bitew");
    });

    test("the same dictionary read as English takes other", () => {
      // Proof the category comes from the locale rather than from the message.
      const en = createTranslate(dictionary, { locale: "en" });
      assert.strictEqual(en("battles", { count: 5 }), "5 bitwy");
    });
  });

  describe("createTranslate: fallback dictionary", () => {
    const french = { known: "Connu" };
    const english = {
      only: "{count, plural, one {# tank} other {# tanks}}",
    };

    test("a key served from the fallback is still formatted", () => {
      const t = createTranslate(french, {
        fallback: english,
        locale: "fr",
        fallbackLocale: "en",
      });
      assert.strictEqual(t("only", { count: 2 }), "2 tanks");
    });

    test("the reader's locale decides the category, not the fallback's", () => {
      // French counts 1 as `one` and so does English, but French counts 0 as
      // `one` where English counts it as `other`. A string borrowed from the
      // English file is still read by a French reader.
      const t = createTranslate(
        {},
        {
          fallback: {
            n: "{count, plural, one {# bataille} other {# batailles}}",
          },
          locale: "fr",
          fallbackLocale: "en",
        },
      );
      assert.strictEqual(t("n", { count: 0 }), "0 bataille");
    });

    test("the primary dictionary still wins", () => {
      const t = createTranslate(
        { only: "{count, plural, one {# char} other {# chars}}" },
        { fallback: english, locale: "fr", fallbackLocale: "en" },
      );
      assert.strictEqual(t("only", { count: 2 }), "2 chars");
    });
  });

  describe("createTranslate: backward compatibility", () => {
    test("the boolean options form still works", () => {
      const t = createTranslate({ a: { b: "{x}" } }, true);
      assert.strictEqual(t("a.b", { x: "ok" }), "ok");
    });

    test("a dictionary written before this feature is untouched", () => {
      const t = createTranslate(
        {
          one: "1 tank",
          many: "{count} tanks",
          braces: "a {b} c {d}",
        },
        { locale: "en" },
      );
      assert.strictEqual(t("one"), "1 tank");
      assert.strictEqual(t("many", { count: 5 }), "5 tanks");
      assert.strictEqual(t("braces", { b: "B" }), "a B c {d}");
    });
  });
}
