#!/usr/bin/env bun
/**
 * Apply Vercel BotID client + next.config wiring to every Next app under apps/.
 * Run from repo root: bun scripts/apply-botid-apps.ts
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const appsDir = resolve(repoRoot, "apps");

const DEFAULT_INSTRUMENTATION = `import { registerAppBotId } from "@awfixersites/auth/botid-client";

registerAppBotId();
`;

const DONATE_INSTRUMENTATION = `import { registerAppBotId } from "@awfixersites/auth/botid-client";
import { BOTID_DONATE_ROUTES } from "@awfixersites/auth/botid-protect";

registerAppBotId(BOTID_DONATE_ROUTES);
`;

const TIPS_INSTRUMENTATION = `import { registerAppBotId } from "@awfixersites/auth/botid-client";
import { BOTID_TIPS_ROUTES } from "@awfixersites/auth/botid-protect";

registerAppBotId(BOTID_TIPS_ROUTES);
`;

const ARMY_INSTRUMENTATION = `import { registerAppBotId } from "@awfixersites/auth/botid-client";
import { BOTID_ARMY_ROUTES } from "@awfixersites/auth/botid-protect";

registerAppBotId(BOTID_ARMY_ROUTES);
`;

function instrumentationForApp(appName: string): string {
  if (appName === "donate") return DONATE_INSTRUMENTATION;
  if (appName === "tips") return TIPS_INSTRUMENTATION;
  if (appName === "army") return ARMY_INSTRUMENTATION;
  return DEFAULT_INSTRUMENTATION;
}

function patchNextConfig(appDir: string): boolean {
  const configPath = resolve(appDir, "next.config.ts");
  if (!existsSync(configPath)) return false;

  let content = readFileSync(configPath, "utf8");
  if (content.includes("withBotId")) return false;

  if (!content.includes('from "botid/next/config"')) {
    content = `import { withBotId } from "botid/next/config";\n${content}`;
  }

  if (/export default nextConfig;/.test(content)) {
    content = content.replace(
      /export default nextConfig;/,
      "export default withBotId(nextConfig);",
    );
  } else if (/export default withMdx\(/.test(content)) {
    content = content.replace(/export default withMdx\(/, "export default withBotId(withMdx(");
    content = content.replace(/\}\);\s*$/m, "}));");
  } else if (/export default (\w+);/.test(content)) {
    content = content.replace(/export default (\w+);/, "export default withBotId($1);");
  } else {
    return false;
  }

  writeFileSync(configPath, content);
  return true;
}

function writeInstrumentation(appDir: string, appName: string): boolean {
  const path = resolve(appDir, "instrumentation-client.ts");
  if (existsSync(path)) return false;
  writeFileSync(path, instrumentationForApp(appName));
  return true;
}

for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const appName = dirent.name;
  const appDir = resolve(appsDir, appName);
  const nextConfig = resolve(appDir, "next.config.ts");
  if (!existsSync(nextConfig)) continue;

  const configPatched = patchNextConfig(appDir);
  const instrWritten = writeInstrumentation(appDir, appName);
  if (configPatched || instrWritten) {
    console.log(
      `${appName}: ${configPatched ? "next.config" : ""}${configPatched && instrWritten ? " + " : ""}${instrWritten ? "instrumentation-client" : ""}`,
    );
  }
}
