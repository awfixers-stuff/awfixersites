#!/usr/bin/env bun
/**
 * Autonoma REST API CLI — configure setups, secrets, recipes, and artifacts
 * without touching the dashboard.
 *
 * Usage:
 *   bun scripts/autonoma-cli.ts verify
 *   bun scripts/autonoma-cli.ts configure
 *   bun scripts/autonoma-cli.ts setup create
 *   bun scripts/autonoma-cli.ts secrets list --app template
 *   bun scripts/autonoma-cli.ts secrets sync --app auth --from-env DATABASE_URL,AUTH_SECRET
 *   bun scripts/autonoma-cli.ts recipes upload
 *   bun scripts/autonoma-cli.ts apps list
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { listAutonomaApps } from "./autonoma/apps.ts";
import { AutonomaApiError, AutonomaClient } from "./autonoma/client.ts";
import {
  autonomaDir,
  readGenerationId,
  resolveAutonomaConfig,
  writeGenerationId,
} from "./autonoma/config.ts";
import { secretsForApp } from "./autonoma/secrets.ts";
import { listAutonomaTargetApps, listBootstrappedApps } from "./autonoma/targets.ts";
import { loadRootEnvLocal } from "./load-root-env.ts";

const repoRoot = resolve(import.meta.dir, "..");

function usage(): never {
  console.error(`Usage:
  bun scripts/autonoma-cli.ts verify
  bun scripts/autonoma-cli.ts configure [--repo <name>]
  bun scripts/autonoma-cli.ts setup create [--repo <name>]
  bun scripts/autonoma-cli.ts setup show
  bun scripts/autonoma-cli.ts secrets list --app <name>
  bun scripts/autonoma-cli.ts secrets sync --app <name> --from-env KEY1,KEY2
  bun scripts/autonoma-cli.ts secrets put --app <name> --key KEY --value VAL
  bun scripts/autonoma-cli.ts recipes upload [--file autonoma/scenario-recipes.json]
  bun scripts/autonoma-cli.ts apps list
  bun scripts/autonoma-cli.ts apps targets
  bun scripts/autonoma-cli.ts configure-all [--dry-run]`);
  process.exit(1);
}

function parseArgs(argv: string[]) {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  let command = argv[0];
  let sub: string | undefined;
  let rest: string[];

  if (command === "configure-all") {
    sub = undefined;
    rest = argv.slice(1);
  } else {
    sub = argv[1];
    rest = argv.slice(2);
    if (sub?.startsWith("-")) {
      rest = [sub, ...rest];
      sub = undefined;
    }
  }

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--repo") flags.repo = rest[++i] ?? "";
    else if (arg === "--app") flags.app = rest[++i] ?? "";
    else if (arg === "--key") flags.key = rest[++i] ?? "";
    else if (arg === "--value") flags.value = rest[++i] ?? "";
    else if (arg === "--file") flags.file = rest[++i] ?? "";
    else if (arg === "--from-env") flags.fromEnv = rest[++i] ?? "";
    else if (arg === "--dry-run") flags.dryRun = true;
    else positionals.push(arg);
  }

  return { command, sub, flags, positionals };
}

function requireString(value: string | boolean | undefined, label: string): string {
  if (typeof value !== "string" || !value) {
    console.error(`[autonoma] missing ${label}`);
    usage();
  }
  return value;
}

async function verifyAuth(client: AutonomaClient, applicationId: string) {
  const apps = listAutonomaApps(repoRoot);
  const probeApp = apps[0]?.name ?? "web";

  try {
    const keys = await client.listSecrets(probeApp);
    console.log(`[autonoma] API auth OK`);
    console.log(`  applicationId: ${applicationId}`);
    console.log(`  probe app:     ${probeApp} (${keys.length} secret keys)`);
    return true;
  } catch (error) {
    if (error instanceof AutonomaApiError && error.status === 401) {
      console.error(`[autonoma] API auth failed (401 Unauthorized)`);
      console.error(`  Your AUTONOMA_SECRET_ID / AUTONOMA_API_KEY is not accepted.`);
      console.error(
        `  Create an org API key in Autonoma → Settings → API keys (ak_live_... format).`,
      );
      console.error(`  Then set AUTONOMA_API_KEY in .env.local (or replace AUTONOMA_SECRET_ID).`);
      console.error(`  AUTONOMA_CLIENT_ID maps to applicationId: ${applicationId}`);
      return false;
    }
    throw error;
  }
}

function ensureAutonomaScaffold(docsUrl: string) {
  const dir = autonomaDir(repoRoot);
  mkdirSync(resolve(dir, "skills"), { recursive: true });
  mkdirSync(resolve(dir, "qa-tests"), { recursive: true });
  writeFileSync(resolve(dir, ".docs-url"), `${docsUrl}\n`);

  const apps = listAutonomaApps(repoRoot);
  writeFileSync(
    resolve(dir, "apps.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), apps }, null, 2)}\n`,
  );
}

async function cmdConfigure(
  client: AutonomaClient,
  config: ReturnType<typeof resolveAutonomaConfig>,
  repoName: string,
) {
  ensureAutonomaScaffold(config.docsUrl);

  const authed = await verifyAuth(client, config.applicationId);
  if (!authed) {
    console.error(
      `[autonoma] Local scaffold written to autonoma/ — fix API key, then re-run configure.`,
    );
    process.exit(1);
  }

  const existing = readGenerationId(repoRoot);
  if (existing) {
    console.log(`[autonoma] setup already exists: ${existing}`);
    const setup = await client.getSetup(existing);
    console.log(JSON.stringify(setup, null, 2));
    return;
  }

  const setup = await client.createSetup(repoName);
  writeGenerationId(repoRoot, setup.id);

  await client.emitEvent(setup.id, "step.started", {
    step: 0,
    name: "Knowledge Base",
  });

  console.log(`[autonoma] configured`);
  console.log(`  generation id: ${setup.id}`);
  console.log(`  docs url:      ${config.docsUrl}`);
  console.log(`  apps:          ${listAutonomaApps(repoRoot).length} (see autonoma/apps.json)`);
  console.log(`\nNext (no dashboard):`);
  console.log(
    `  1. Run /autonoma-ai or the Test Planner pipeline to generate autonoma/* artifacts`,
  );
  console.log(`  2. bun scripts/autonoma-cli.ts recipes upload   (after Step 5)`);
  console.log(
    `  3. bun scripts/autonoma-cli.ts secrets sync --app auth --from-env DATABASE_URL,AUTH_SECRET`,
  );
}

async function cmdSecretsSync(client: AutonomaClient, appName: string, envKeys: string[]) {
  loadRootEnvLocal();
  const items = envKeys
    .map((key) => {
      const value = process.env[key];
      if (!value) {
        console.warn(`[autonoma] skipping ${key} — not set in environment`);
        return null;
      }
      return { key, value };
    })
    .filter((item): item is { key: string; value: string } => item !== null);

  if (items.length === 0) {
    console.error(`[autonoma] no secrets to upload`);
    process.exit(1);
  }

  await client.upsertSecrets(appName, items);
  console.log(`[autonoma] uploaded ${items.length} secret(s) to Previewkit app "${appName}"`);
  for (const item of items) console.log(`  - ${item.key}`);
}

async function cmdConfigureAll(
  client: AutonomaClient,
  config: ReturnType<typeof resolveAutonomaConfig>,
  dryRun: boolean,
) {
  loadRootEnvLocal();
  const targets = listAutonomaTargetApps(repoRoot);
  const skipped = listBootstrappedApps(repoRoot);

  console.log(`[autonoma] targets: ${targets.map((a) => a.name).join(", ")}`);
  console.log(`[autonoma] skipped (bootstrapped): ${skipped.map((a) => a.name).join(", ")}`);

  const manifest = {
    configuredAt: new Date().toISOString(),
    applicationId: config.applicationId,
    targets: targets.map((a) => a.name),
    skipped: skipped.map((a) => a.name),
    apps: [] as Array<{ name: string; secrets: string[]; status: string }>,
  };

  for (const app of targets) {
    const keys = secretsForApp(app.name);
    const items = keys
      .map((key) => {
        let value = process.env[key];
        if (!value && key === "AUTH_IDP_URL") {
          value = process.env.AUTH_URL ?? process.env.BETTER_AUTH_URL;
        }
        if (!value && key === "NEXT_PUBLIC_AUTH_IDP_URL") {
          value = process.env.AUTH_URL ?? process.env.BETTER_AUTH_URL;
        }
        if (
          key === "AUTH_OAUTH_SITE_KEY" &&
          !value &&
          app.name !== "auth" &&
          app.name !== "template"
        ) {
          value = app.name;
        }
        if (!value) return null;
        return { key, value };
      })
      .filter((item): item is { key: string; value: string } => item !== null);

    if (items.length === 0) {
      manifest.apps.push({ name: app.name, secrets: [], status: "no-env-values" });
      console.warn(`[autonoma] ${app.name}: no env values to upload`);
      continue;
    }

    if (dryRun) {
      manifest.apps.push({
        name: app.name,
        secrets: items.map((i) => i.key),
        status: "dry-run",
      });
      console.log(`[autonoma] ${app.name}: would upload ${items.map((i) => i.key).join(", ")}`);
      continue;
    }

    await client.upsertSecrets(app.name, items);
    manifest.apps.push({
      name: app.name,
      secrets: items.map((i) => i.key),
      status: "uploaded",
    });
    console.log(`[autonoma] ${app.name}: uploaded ${items.length} secret(s)`);
  }

  const dir = autonomaDir(repoRoot);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "configure-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function cmdRecipesUpload(client: AutonomaClient, filePath: string) {
  const setupId = readGenerationId(repoRoot);
  if (!setupId) {
    console.error(`[autonoma] no generation id — run: bun scripts/autonoma-cli.ts configure`);
    process.exit(1);
  }

  const abs = resolve(repoRoot, filePath);
  if (!existsSync(abs)) {
    console.error(`[autonoma] file not found: ${abs}`);
    process.exit(1);
  }

  const recipes = JSON.parse(readFileSync(abs, "utf8"));
  await client.uploadScenarioRecipes(setupId, recipes);
  console.log(`[autonoma] uploaded scenario recipes from ${filePath} to setup ${setupId}`);
}

async function main() {
  const { command, sub, flags } = parseArgs(process.argv.slice(2));
  if (!command) usage();

  if (command === "apps" && sub === "list") {
    for (const app of listAutonomaApps(repoRoot)) {
      console.log(`${app.name}\t${app.vercelProject}\t${app.workspace}`);
    }
    return;
  }

  if (command === "apps" && sub === "targets") {
    console.log("targets:");
    for (const app of listAutonomaTargetApps(repoRoot)) {
      console.log(`  ${app.name}`);
    }
    console.log("skipped:");
    for (const app of listBootstrappedApps(repoRoot)) {
      console.log(`  ${app.name}`);
    }
    return;
  }

  const config = resolveAutonomaConfig(repoRoot);
  const client = new AutonomaClient(config);
  const repoName = typeof flags.repo === "string" && flags.repo ? flags.repo : "awfixersites";
  const dryRun = flags.dryRun === true;

  switch (`${command}:${sub ?? ""}`) {
    case "verify:":
      await verifyAuth(client, config.applicationId);
      return;

    case "configure:":
      await cmdConfigure(client, config, repoName);
      return;

    case "configure-all:":
      if (!dryRun) {
        const ok = await verifyAuth(client, config.applicationId);
        if (!ok) process.exit(1);
      }
      await cmdConfigureAll(client, config, dryRun);
      return;

    case "setup:create":
      await cmdConfigure(client, config, repoName);
      return;

    case "setup:show": {
      const id = readGenerationId(repoRoot);
      if (!id) {
        console.error(`[autonoma] no .generation-id — run configure first`);
        process.exit(1);
      }
      console.log(JSON.stringify(await client.getSetup(id), null, 2));
      return;
    }

    case "secrets:list": {
      const app = requireString(flags.app, "--app");
      const keys = await client.listSecrets(app);
      if (keys.length === 0) console.log("(no keys)");
      else for (const key of keys) console.log(key);
      return;
    }

    case "secrets:sync": {
      const app = requireString(flags.app, "--app");
      const fromEnv = requireString(flags.fromEnv, "--from-env");
      await cmdSecretsSync(
        client,
        app,
        fromEnv
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      );
      return;
    }

    case "secrets:put": {
      const app = requireString(flags.app, "--app");
      const key = requireString(flags.key, "--key");
      const value = requireString(flags.value, "--value");
      await client.upsertSecret(app, key, value);
      console.log(`[autonoma] set ${key} on app ${app}`);
      return;
    }

    case "recipes:upload": {
      const file =
        typeof flags.file === "string" && flags.file
          ? flags.file
          : "autonoma/scenario-recipes.json";
      await cmdRecipesUpload(client, file);
      return;
    }

    default:
      usage();
  }
}

main().catch((error) => {
  if (error instanceof AutonomaApiError) {
    console.error(`[autonoma] ${error.message}`);
    if (error.body) console.error(error.body);
    process.exit(1);
  }
  throw error;
});
