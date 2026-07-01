#!/usr/bin/env bun
/**
 * Replace `import Link from "next/link";` with the CLink-backed alias
 * everywhere in apps/ and packages/. Run from repo root:
 * bun scripts/apply-clink-imports.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const roots = ["apps", "packages"].map((dir) => resolve(repoRoot, dir));

const OLD_IMPORT = 'import Link from "next/link";';
const NEW_IMPORT = 'import { CLink as Link } from "@awfixersites/telemetry/link";';
const SKIP_DIRS = new Set(["node_modules", ".next", "dist"]);

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const content = readFileSync(file, "utf8");
    if (!content.includes(OLD_IMPORT)) continue;
    writeFileSync(file, content.replace(OLD_IMPORT, NEW_IMPORT));
    changed += 1;
    console.log(`patched: ${file}`);
  }
}
console.log(`${changed} file(s) patched`);
