import { readFile } from "node:fs/promises";
import path from "node:path";

// Claude Code's `/plugin marketplace add <url>` fetches the given URL as-is
// (it does NOT append `/.claude-plugin/marketplace.json`). The docs tell users
// to run `/plugin marketplace add https://onruntime.com/plugins`, so serve the
// marketplace manifest directly at the bare `/plugins` URL. The canonical file
// still lives at /plugins/.claude-plugin/marketplace.json for relative resolution.
export const dynamic = "force-static";

export async function GET() {
  const manifest = await readFile(
    path.join(
      process.cwd(),
      "public",
      "plugins",
      ".claude-plugin",
      "marketplace.json",
    ),
    "utf8",
  );

  return new Response(manifest, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
