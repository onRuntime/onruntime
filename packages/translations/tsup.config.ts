/// <reference types="node" />
import { defineConfig } from "tsup";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const addUseClient = async () => {
  const distDir = join(process.cwd(), "dist");

  // Handle subdirectories (react/, next/) - NOT next/app/ (server-callable)
  for (const subdir of ["react", "next"]) {
    const subdirPath = join(distDir, subdir);
    try {
      const subFiles = await readdir(subdirPath);
      for (const file of subFiles) {
        // Skip directories (like app/, server/)
        if (!file.includes(".")) continue;
        if (file.endsWith(".js") || file.endsWith(".cjs")) {
          const filePath = join(subdirPath, file);
          const content = await readFile(filePath, "utf-8");
          if (!content.startsWith('"use client"')) {
            await writeFile(filePath, `"use client";\n${content}`);
          }
        }
      }
    } catch {
      // Directory might not exist
    }
  }

  // Handle shared chunks (for react/next)
  const files = await readdir(distDir);
  for (const file of files) {
    if (
      file.startsWith("chunk-") &&
      (file.endsWith(".js") || file.endsWith(".cjs"))
    ) {
      const filePath = join(distDir, file);
      const content = await readFile(filePath, "utf-8");
      if (!content.startsWith('"use client"')) {
        await writeFile(filePath, `"use client";\n${content}`);
      }
    }
  }
};

export default defineConfig([
  // Main entry - framework agnostic (types, core functions, server)
  {
    entry: {
      index: "src/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    splitting: false,
    treeshake: true,
  },
  // Client bundles (react, next) - with "use client" and splitting
  {
    entry: {
      "react/index": "src/react/index.ts",
      "next/index": "src/next/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    external: ["react", "react-dom", "next", "@onruntime/translations"],
    splitting: true,
    treeshake: true,
    onSuccess: addUseClient,
  },
  // Next.js server entry (NO "use client" - server-only)
  {
    entry: {
      "next/server/index": "src/next/server/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    external: ["react", "react-dom", "next", "@onruntime/translations"],
    splitting: false,
    treeshake: true,
  },
  // Vite plugin
  {
    entry: {
      "vite/index": "src/vite/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    external: ["vite", "@onruntime/translations"],
    splitting: false,
    treeshake: true,
  },
]);
