import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { dirname, resolve, join } from "path";

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
const WEB_ROOT = resolve(SCRIPT_DIR, "..");

import { config } from "dotenv-flow";
config({ path: WEB_ROOT });

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import matter from "gray-matter";
import { localeCodes, defaultLocale, type Locale } from "../src/lib/translations";

const LOCALES_DIR = "src/locales";
const CONTENT_DIR = "src/content";
const CONCURRENCY = 25;

function getTargetLocales(): Locale[] {
  return localeCodes.filter((l) => l !== defaultLocale) as Locale[];
}

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

interface TranslationTask {
  type: "json" | "mdx";
  sourcePath: string;
  targetPath: string;
  targetLocale: Locale;
  namespace: string;
}

interface TranslationResult {
  targetPath: string;
  content: string;
}

// ============ Progress Tracker ============

class ProgressTracker {
  private completed = 0;
  private total = 0;
  private inProgress = 0;
  private written = 0;

  setTotal(total: number) {
    this.total = total;
  }

  start() {
    this.inProgress++;
  }

  complete() {
    this.completed++;
    this.inProgress--;
  }

  incrementWritten() {
    this.written++;
  }

  getWritten() {
    return this.written;
  }

  log(message: string) {
    const progress = `[${this.completed}/${this.total}]`;
    const active = this.inProgress > 0 ? ` (${this.inProgress} active)` : "";
    console.log(`${progress}${active} ${message}`);
  }
}

const progress = new ProgressTracker();

// ============ File Utils ============

function getAllFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllFiles(fullPath, ext));
    } else if (item.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function toAbsolutePath(gitPath: string): string {
  return resolve(WEB_ROOT, gitPath.replace("apps/web/", ""));
}

function readFile(gitPath: string): string | null {
  try {
    return readFileSync(toAbsolutePath(gitPath), "utf-8");
  } catch {
    return null;
  }
}

function readJson(gitPath: string): JsonObject | null {
  const content = readFile(gitPath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function flattenJson(obj: JsonObject, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      Object.assign(result, flattenJson(value as JsonObject, fullKey));
    }
  }
  return result;
}

function mergeTranslations(
  source: JsonObject,
  target: JsonObject,
  translated: Record<string, string>,
  prefix = ""
): JsonObject {
  const result: JsonObject = {};

  for (const [key, value] of Object.entries(source)) {
    const flatKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const targetChild = (target[key] as JsonObject) || {};
      result[key] = mergeTranslations(
        value as JsonObject,
        targetChild,
        translated,
        flatKey
      );
    } else {
      if (key in target) {
        result[key] = target[key];
      } else if (flatKey in translated) {
        result[key] = translated[flatKey];
      }
    }
  }
  return result;
}

// ============ Translation API ============

async function translateBatch(
  texts: Record<string, string>,
  sourceLang: Locale,
  targetLang: Locale
): Promise<Record<string, string>> {
  if (Object.keys(texts).length === 0) return {};

  const entries = Object.entries(texts);
  const schema = z.object({
    items: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    ),
  });

  const { object } = await generateObject({
    model: openai.chat("gpt-4o-mini"),
    schema,
    prompt: `Translate from ${sourceLang} to ${targetLang}.

Rules:
- Keep HTML tags and {variables} intact
- Start sentences with a capital letter (like the source text)
- Do NOT use title case (e.g., "Our services" not "Our Services")
- Use casual tone (no em-dashes or semicolons)
- ICU arguments like {count, plural, one {# item} other {# items}} or
  {gender, select, m {...} other {...}}: keep the argument name, the keyword and
  the # as they are, and translate ONLY the text inside each branch
- Give a plural argument the branches ${targetLang} actually needs, which may be
  more or fewer than the source has. Polish and Russian need one/few/many,
  Arabic needs zero/one/two/few/many/other, Japanese and Chinese need only
  other. Always include an other branch

${JSON.stringify(entries.map(([key, value]) => ({ key, value })))}`,
  });

  return Object.fromEntries(object.items.map((item) => [item.key, item.value]));
}

async function translateMarkdown(
  content: string,
  sourceLang: Locale,
  targetLang: Locale
): Promise<string> {
  if (!content.trim()) return content;

  const { text } = await generateText({
    model: openai.chat("gpt-4o-mini"),
    prompt: `Translate the following Markdown content from ${sourceLang} to ${targetLang}.

Rules:
- Keep all Markdown formatting intact (headers, lists, bold, italic, links, code blocks)
- Keep all URLs, email addresses, and code unchanged
- Preserve capitalization style
- Use casual tone (no em-dashes or semicolons)
- Keep brand names and technical terms unchanged (onRuntime, API, REST, GraphQL, etc.)
- Output ONLY the translated Markdown, no explanations

Content to translate:
${content}`,
  });

  return text;
}

// ============ Task Collection ============

function collectTasks(): TranslationTask[] {
  const tasks: TranslationTask[] = [];
  const targetLocales = getTargetLocales();

  // Collect JSON tasks
  const jsonDir = resolve(WEB_ROOT, LOCALES_DIR, defaultLocale);
  const jsonFiles = getAllFiles(jsonDir, ".json");

  for (const file of jsonFiles) {
    const namespace = file.replace(jsonDir + "/", "").replace(".json", "");
    const sourcePath = `apps/web/${LOCALES_DIR}/${defaultLocale}/${namespace}.json`;

    for (const targetLocale of targetLocales) {
      const targetPath = `apps/web/${LOCALES_DIR}/${targetLocale}/${namespace}.json`;
      tasks.push({
        type: "json",
        sourcePath,
        targetPath,
        targetLocale,
        namespace,
      });
    }
  }

  // Collect MDX tasks
  const mdxDir = resolve(WEB_ROOT, CONTENT_DIR, defaultLocale);
  const mdxFiles = getAllFiles(mdxDir, ".mdx");

  for (const file of mdxFiles) {
    const contentPath = file.replace(mdxDir + "/", "").replace(".mdx", "");
    const sourcePath = `apps/web/${CONTENT_DIR}/${defaultLocale}/${contentPath}.mdx`;

    for (const targetLocale of targetLocales) {
      const targetPath = `apps/web/${CONTENT_DIR}/${targetLocale}/${contentPath}.mdx`;
      tasks.push({
        type: "mdx",
        sourcePath,
        targetPath,
        targetLocale,
        namespace: contentPath,
      });
    }
  }

  return tasks;
}

// ============ Task Execution ============

async function executeJsonTask(task: TranslationTask): Promise<TranslationResult | null> {
  const sourceJson = readJson(task.sourcePath);
  if (!sourceJson) return null;

  const sourceFlat = flattenJson(sourceJson);
  const targetJson = readJson(task.targetPath) || {};
  const targetFlat = flattenJson(targetJson);

  const missingKeys: Record<string, string> = {};
  for (const [key, value] of Object.entries(sourceFlat)) {
    if (!(key in targetFlat)) {
      missingKeys[key] = value;
    }
  }

  if (Object.keys(missingKeys).length === 0) return null;

  progress.log(`🔄 ${task.namespace} (${defaultLocale} → ${task.targetLocale}) - ${Object.keys(missingKeys).length} keys`);

  const translated = await translateBatch(missingKeys, defaultLocale, task.targetLocale);
  const newTargetJson = mergeTranslations(sourceJson, targetJson, translated);

  return {
    targetPath: task.targetPath,
    content: JSON.stringify(newTargetJson, null, 2) + "\n",
  };
}

async function executeMdxTask(task: TranslationTask): Promise<TranslationResult | null> {
  const sourceContent = readFile(task.sourcePath);
  if (!sourceContent) return null;

  const targetContent = readFile(task.targetPath);

  // If target exists, check if we need to update frontmatter
  if (targetContent) {
    const { data: sourceFrontmatter } = matter(sourceContent);
    const { data: targetFrontmatter, content: targetMarkdown } = matter(targetContent);

    const frontmatterToTranslate: Record<string, string> = {};
    for (const [key, value] of Object.entries(sourceFrontmatter)) {
      if (typeof value === "string" && !(key in targetFrontmatter)) {
        frontmatterToTranslate[key] = value;
      }
    }

    if (Object.keys(frontmatterToTranslate).length === 0) return null;

    progress.log(`🔄 ${task.namespace} (${defaultLocale} → ${task.targetLocale}) - frontmatter`);

    const translatedFrontmatter = await translateBatch(
      frontmatterToTranslate,
      defaultLocale,
      task.targetLocale
    );

    const newFrontmatter = { ...targetFrontmatter };
    for (const [key, value] of Object.entries(sourceFrontmatter)) {
      if (!(key in newFrontmatter)) {
        if (typeof value === "string" && key in translatedFrontmatter) {
          newFrontmatter[key] = translatedFrontmatter[key];
        } else {
          newFrontmatter[key] = value;
        }
      }
    }

    return {
      targetPath: task.targetPath,
      content: matter.stringify(targetMarkdown, newFrontmatter),
    };
  }

  // Target doesn't exist - translate everything
  progress.log(`🔄 ${task.namespace} (${defaultLocale} → ${task.targetLocale}) - full MDX`);

  const { data: sourceFrontmatter, content: sourceMarkdown } = matter(sourceContent);

  // Translate frontmatter strings
  const frontmatterToTranslate: Record<string, string> = {};
  for (const [key, value] of Object.entries(sourceFrontmatter)) {
    if (typeof value === "string") {
      frontmatterToTranslate[key] = value;
    }
  }

  const translatedFrontmatter = Object.keys(frontmatterToTranslate).length > 0
    ? await translateBatch(frontmatterToTranslate, defaultLocale, task.targetLocale)
    : {};

  const newFrontmatter: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sourceFrontmatter)) {
    if (typeof value === "string" && key in translatedFrontmatter) {
      newFrontmatter[key] = translatedFrontmatter[key];
    } else {
      newFrontmatter[key] = value;
    }
  }

  const translatedMarkdown = await translateMarkdown(sourceMarkdown, defaultLocale, task.targetLocale);

  return {
    targetPath: task.targetPath,
    content: matter.stringify(translatedMarkdown, newFrontmatter),
  };
}

function writeResult(result: TranslationResult): void {
  const absPath = toAbsolutePath(result.targetPath);
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, result.content);
  progress.incrementWritten();
}

async function executeTask(task: TranslationTask): Promise<void> {
  progress.start();
  try {
    const result = task.type === "json"
      ? await executeJsonTask(task)
      : await executeMdxTask(task);

    if (result) {
      writeResult(result);
    }
  } finally {
    progress.complete();
  }
}

// ============ Parallel Execution ============

async function runWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      results[currentIndex] = await fn(item);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);

  return results;
}

// ============ Main ============

async function main() {
  console.log("📊 Collecting translation tasks...\n");

  const tasks = collectTasks();

  if (tasks.length === 0) {
    console.log("No translation tasks found.");
    return;
  }

  console.log(`📁 Found ${tasks.length} potential tasks (${tasks.filter(t => t.type === "json").length} JSON, ${tasks.filter(t => t.type === "mdx").length} MDX)`);
  console.log(`⚡ Processing with concurrency: ${CONCURRENCY}\n`);

  progress.setTotal(tasks.length);

  await runWithConcurrency(tasks, executeTask, CONCURRENCY);

  const written = progress.getWritten();
  if (written === 0) {
    console.log("\n✅ All translations are up to date.");
  } else {
    console.log(`\n🎉 Generated ${written} translation file(s).`);
  }
}

main().catch(console.error);
