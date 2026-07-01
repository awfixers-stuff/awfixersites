import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildVercelProjectRegistry,
  deploymentCheckStatusName,
  listVercelDeploymentChecks,
  resolveWorkspaceForVercelProject,
} from "./vercel-deployment-checks.ts";

const repoRoot = resolve(import.meta.dir, "..");

describe("vercel deployment checks registry", () => {
  it("maps every apps/* vercel.ts project to a workspace", () => {
    const appsDir = resolve(repoRoot, "apps");
    const registry = buildVercelProjectRegistry(repoRoot);

    for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      const vercelTs = resolve(appsDir, dirent.name, "vercel.ts");
      if (!existsSync(vercelTs)) continue;

      const project = [...registry.entries()].find(
        ([, workspace]) => workspace === `apps/${dirent.name}`,
      );
      expect(project, `missing registry entry for apps/${dirent.name}`).toBeDefined();
    }
  });

  it("formats status names for Vercel Deployment Checks", () => {
    expect(deploymentCheckStatusName("awfixersites-careers", "lint")).toBe(
      "Vercel - awfixersites-careers: lint",
    );
    expect(deploymentCheckStatusName("awfixersites-careers", "typecheck")).toBe(
      "Vercel - awfixersites-careers: typecheck",
    );
  });

  it("resolves careers project", () => {
    expect(resolveWorkspaceForVercelProject("awfixersites-careers", repoRoot)).toBe("apps/careers");
  });

  it("lists lint and typecheck for each project", () => {
    const checks = listVercelDeploymentChecks(repoRoot);
    const careersLint = checks.find(
      (entry) => entry.name === "Vercel - awfixersites-careers: lint",
    );
    expect(careersLint?.workspace).toBe("apps/careers");
    expect(checks.length).toBe(buildVercelProjectRegistry(repoRoot).size * 2);
  });
});
