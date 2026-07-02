#!/usr/bin/env bun
/**
 * Wire @awfixersites/telemetry (init + CLink) into every Next app under apps/.
 * Run from repo root: bun scripts/apply-telemetry-apps.ts
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const appsDir = resolve(repoRoot, "apps");

function patchPackageJson(appDir: string): boolean {
  const path = resolve(appDir, "package.json");
  if (!existsSync(path)) return false;
  const pkg = JSON.parse(readFileSync(path, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  pkg.dependencies ??= {};
  if (pkg.dependencies["@awfixersites/telemetry"]) return false;
  pkg.dependencies["@awfixersites/telemetry"] = "catalog:workspace";
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  return true;
}

function patchNextConfig(appDir: string): boolean {
  const path = resolve(appDir, "next.config.ts");
  if (!existsSync(path)) return false;
  const content = readFileSync(path, "utf8");
  if (content.includes("@awfixersites/telemetry")) return false;
  if (!/transpilePackages:\s*\[/.test(content)) return false;
  const patched = content.replace(
    /transpilePackages:\s*\[/,
    'transpilePackages: ["@awfixersites/telemetry", ',
  );
  writeFileSync(path, patched);
  return true;
}

function patchInstrumentationClient(appDir: string, appName: string): boolean {
  const path = resolve(appDir, "instrumentation-client.ts");
  if (!existsSync(path)) return false;
  let content = readFileSync(path, "utf8");
  if (content.includes("registerAppTelemetry")) return false;
  if (!content.includes('from "@awfixersites/telemetry/register"')) {
    content = `import { registerAppTelemetry } from "@awfixersites/telemetry/register";\n${content}`;
  }
  content = `${content.trimEnd()}\nregisterAppTelemetry({ app: "${appName}" });\n`;
  writeFileSync(path, content);
  return true;
}

function writeInstrumentationServer(appDir: string, appName: string): boolean {
  const path = resolve(appDir, "instrumentation.ts");
  if (existsSync(path)) return false;
  const content = `import { onRequestErrorTelemetry, registerServerTelemetry } from "@awfixersites/telemetry/register-server";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerServerTelemetry({ app: "${appName}" });
  }
}

export const onRequestError = onRequestErrorTelemetry;
`;
  writeFileSync(path, content);
  return true;
}

function writeClinkJson(appDir: string, appName: string): boolean {
  const path = resolve(appDir, "clink.json");
  if (existsSync(path)) return false;
  const config = {
    $schema: "../../packages/telemetry/clink.schema.json",
    network: [],
    utm: { source: appName, medium: "referral", campaign: null },
    click: { event: "link_clicked", properties: { app: appName } },
    exclude: ["mailto:*", "tel:*"],
  };
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
  return true;
}

function patchEnvExample(appDir: string): boolean {
  const path = resolve(appDir, ".env.example");
  if (!existsSync(path)) return false;
  const content = readFileSync(path, "utf8");
  if (content.includes("NEXT_PUBLIC_SENTRY_DSN")) return false;
  const addition = "NEXT_PUBLIC_SENTRY_DSN=\nNEXT_PUBLIC_POSTHOG_KEY=\nNEXT_PUBLIC_POSTHOG_HOST=\n";
  writeFileSync(path, `${content.trimEnd()}\n${addition}`);
  return true;
}

function patchLayout(appDir: string): boolean {
  const path = resolve(appDir, "app/layout.tsx");
  if (!existsSync(path)) return false;
  let content = readFileSync(path, "utf8");
  if (content.includes("ClinkProvider")) return false;
  if ((content.match(/\{children\}/g) ?? []).length !== 1) {
    console.warn(`  skip layout wrap: unexpected {children} count in ${path}`);
    return false;
  }
  content = content.replace(
    "{children}",
    "<ClinkProvider config={clinkConfig}>{children}</ClinkProvider>",
  );
  const imports =
    'import { ClinkProvider } from "@awfixersites/telemetry/link";\nimport clinkConfig from "../clink.json";\n';
  content = `${imports}${content}`;
  writeFileSync(path, content);
  return true;
}

for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const appName = dirent.name;
  const appDir = resolve(appsDir, appName);
  if (!existsSync(resolve(appDir, "next.config.ts"))) continue;

  const results = {
    "package.json": patchPackageJson(appDir),
    "next.config.ts": patchNextConfig(appDir),
    "instrumentation-client.ts": patchInstrumentationClient(appDir, appName),
    "instrumentation.ts": writeInstrumentationServer(appDir, appName),
    "clink.json": writeClinkJson(appDir, appName),
    ".env.example": patchEnvExample(appDir),
    "app/layout.tsx": patchLayout(appDir),
  };

  const applied = Object.entries(results)
    .filter(([, changed]) => changed)
    .map(([file]) => file);
  if (applied.length > 0) {
    console.log(`${appName}: ${applied.join(", ")}`);
  }
}
