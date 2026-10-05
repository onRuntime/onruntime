import path from "node:path";
import { CONTENT_DIR, SOURCE_LOCALE } from "../locales";
import { conventionTests } from "./convention";
import { hookTests } from "./hook";

export { SOURCE_LOCALE };

export const PLUGIN_DIR = path.join(__dirname, "../../../public/plugins/gitmoji");
export const CONVENTION_FILE = path.join(PLUGIN_DIR, "convention.json");
export const VALIDATOR = path.join(PLUGIN_DIR, "scripts/validate-commit.mjs");
export const SITE_MANIFEST = path.join(__dirname, "../../../package.json");
export const DOC_FILE = path.join(
  CONTENT_DIR,
  SOURCE_LOCALE,
  "docs/gitmoji/getting-started.mdx",
);

export type Convention = {
  types: { name: string; description: string }[];
  rules: string[];
  secondVerbs: string[];
  forbiddenFooters: { label: string; pattern: string; flags?: string }[];
  counterExamples: { wrong: string; right: string }[];
  examples: string[];
};

export function gitmojiTests() {
  conventionTests();
  hookTests();
}
