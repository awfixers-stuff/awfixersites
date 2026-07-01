#!/usr/bin/env bun
/**
 * Slim app package.json dependencies to runtime-only deps (P0 deploy-check fix).
 * Run once from repo root: bun scripts/slim-app-deps.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const appsDir = resolve(repoRoot, "apps");

const APP_BINDINGS: Record<string, string> = {
  "@next/swc-linux-x64-gnu": "catalog:nextjs",
  "@oxfmt/binding-linux-x64-gnu": "catalog:bindings",
  "@oxlint-tsgolint/linux-x64": "catalog:bindings",
  "@oxlint/binding-linux-x64-gnu": "catalog:bindings",
  "@rolldown/binding-linux-x64-gnu": "catalog:bindings",
  "@tailwindcss/oxide-linux-x64-gnu": "catalog:css",
  "@typescript/native-preview-linux-x64": "catalog:bindings",
  "lightningcss-linux-x64-gnu": "catalog:css",
};

const BASE_DEPS: Record<string, string> = {
  "@awfixersites/ui": "catalog:workspace",
  ...APP_BINDINGS,
  "@tailwindcss/postcss": "catalog:css",
  "class-variance-authority": "catalog:css",
  clsx: "catalog:css",
  "lucide-react": "catalog:react",
  motion: "catalog:react",
  next: "catalog:nextjs",
  "next-themes": "catalog:nextjs",
  "radix-ui": "catalog:react",
  react: "catalog:react",
  "react-dom": "catalog:react",
  shadcn: "catalog:",
  "tailwind-merge": "catalog:css",
  tailwindcss: "catalog:css",
  "tw-animate-css": "catalog:css",
};

const WORKSPACE_EXTRAS: Record<string, Record<string, string>> = {
  account: {
    "@awfixersites/auth": "catalog:workspace",
  },
  army: {
    "@awfixersites/auth": "catalog:workspace",
    "@awfixersites/content": "catalog:workspace",
    "@awfixersites/db": "catalog:workspace",
    "@awfixersites/mdx": "catalog:workspace",
  },
  "auth-app": {
    "@awfixersites/auth": "catalog:workspace",
  },
  auth: {
    "@awfixersites/auth": "catalog:workspace",
  },
  church: {
    "@awfixersites/auth": "catalog:workspace",
  },
  legal: {
    "@awfixersites/mdx": "catalog:workspace",
    "@tailwindcss/typography": "catalog:css",
  },
  tips: {
    "@hookform/resolvers": "catalog:",
    "react-hook-form": "catalog:react",
    resend: "catalog:",
    zod: "catalog:",
  },
};

const ANALYTICS_BOTH = new Set(["auth", "careers", "church", "codes", "legal", "llc"]);
const ANALYTICS_ONLY = new Set(["tips"]);

function depsForApp(appName: string, pkgName: string): Record<string, string> {
  const deps = { ...BASE_DEPS, ...(WORKSPACE_EXTRAS[appName] ?? WORKSPACE_EXTRAS[pkgName] ?? {}) };

  if (ANALYTICS_BOTH.has(appName)) {
    deps["@vercel/analytics"] = "catalog:vercel";
    deps["@vercel/speed-insights"] = "catalog:vercel";
  } else if (ANALYTICS_ONLY.has(appName)) {
    deps["@vercel/analytics"] = "catalog:vercel";
  }

  const sorted = Object.keys(deps).sort();
  return Object.fromEntries(sorted.map((key) => [key, deps[key]!]));
}

const BUN_VERSION = "1.3.14";

for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;

  const appName = dirent.name;
  const pkgPath = resolve(appsDir, appName, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;

  pkg.dependencies = depsForApp(appName, pkg.name as string);
  pkg.scripts = {
    ...(pkg.scripts as Record<string, string>),
    lint: "oxlint -c ../../src/lint.json .",
    "lint:fix": "oxlint -c ../../src/lint.json . --fix",
  };
  pkg.devEngines = {
    packageManager: { name: "bun", version: BUN_VERSION, onFail: "error" },
    runtime: { name: "bun", version: BUN_VERSION, onFail: "error" },
  };
  pkg.engines = { bun: BUN_VERSION };
  pkg.packageManager = `bun@${BUN_VERSION}`;

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(
    `[slim-app-deps] ${appName} — ${Object.keys(pkg.dependencies as object).length} deps`,
  );
}

const packagesDir = resolve(repoRoot, "packages");
for (const dirent of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;

  const pkgPath = resolve(packagesDir, dirent.name, "package.json");
  if (!readFileSync(pkgPath, "utf8").includes("oxlint")) continue;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
  pkg.scripts = {
    ...(pkg.scripts as Record<string, string>),
    lint: "oxlint -c ../../src/lint.json .",
    "lint:fix": "oxlint -c ../../src/lint.json . --fix",
  };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`[slim-app-deps] packages/${dirent.name} — lint scripts`);
}
