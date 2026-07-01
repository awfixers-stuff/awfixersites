import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadRootEnvLocal } from "../load-root-env.ts";

export type AutonomaConfig = {
  apiUrl: string;
  docsUrl: string;
  apiKey: string;
  applicationId: string;
  repoRoot: string;
};

const DEFAULT_API_URL = "https://api.autonoma.app";
const DEFAULT_DOCS_URL = "https://docs.autonoma.app";

function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** Resolve Autonoma credentials from .env.local with alias support. */
export function resolveAutonomaConfig(repoRoot = resolve(import.meta.dir, "../..")): AutonomaConfig {
  loadRootEnvLocal();

  const apiKey = firstEnv("AUTONOMA_API_KEY", "AUTONOMA_SECRET_ID");
  const applicationId = firstEnv("AUTONOMA_PROJECT_ID", "AUTONOMA_CLIENT_ID", "AUTONOMA_APPLICATION_ID");

  if (!apiKey) {
    throw new Error(
      "Missing Autonoma API key. Set AUTONOMA_API_KEY (or AUTONOMA_SECRET_ID) in .env.local.",
    );
  }

  if (!applicationId) {
    throw new Error(
      "Missing Autonoma application ID. Set AUTONOMA_PROJECT_ID (or AUTONOMA_CLIENT_ID) in .env.local.",
    );
  }

  return {
    apiUrl: firstEnv("AUTONOMA_API_URL") ?? DEFAULT_API_URL,
    docsUrl: firstEnv("AUTONOMA_DOCS_URL") ?? DEFAULT_DOCS_URL,
    apiKey,
    applicationId,
    repoRoot,
  };
}

export function autonomaDir(repoRoot: string) {
  return resolve(repoRoot, "autonoma");
}

export function readGenerationId(repoRoot: string): string | null {
  const path = resolve(autonomaDir(repoRoot), ".generation-id");
  if (!existsSync(path)) return null;
  const id = readFileSync(path, "utf8").trim();
  return id || null;
}

export function writeGenerationId(repoRoot: string, id: string) {
  const dir = autonomaDir(repoRoot);
  if (!existsSync(dir)) {
    throw new Error(`autonoma/ directory missing at ${dir}`);
  }
  Bun.write(resolve(dir, ".generation-id"), `${id}\n`);
}