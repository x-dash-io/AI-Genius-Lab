#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const prismaRunner = process.platform === "win32" ? "npx.cmd" : "npx";

function printOutput(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

function runPrismaStep(label, prismaArgs, options = {}) {
  const { allowFailure = false } = options;
  console.log(`\n[prisma-check] ${label}`);

  const result = spawnSync(prismaRunner, ["prisma", ...prismaArgs], {
    env: process.env,
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(
      `[prisma-check] ${label} failed to execute: ${result.error.message}`,
    );
  }

  printOutput(result);

  if (!allowFailure && result.status !== 0) {
    const status = result.status ?? 1;
    throw new Error(`[prisma-check] ${label} failed with exit code ${status}`);
  }

  return result;
}

function listMigrationFolders() {
  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function databaseMatchesSchema() {
  const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!datasourceUrl) {
    throw new Error(
      "DATABASE_URL or DIRECT_URL must be set before running Prisma deploy checks.",
    );
  }

  const diff = runPrismaStep(
    "Compare existing database schema to prisma/schema.prisma",
    [
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/schema.prisma",
      "--exit-code",
    ],
    { allowFailure: true },
  );

  if (diff.status === 0) {
    return true;
  }

  if (diff.status === 2) {
    return false;
  }

  throw new Error(
    "[prisma-check] Schema diff failed unexpectedly. Cannot determine safe baseline state.",
  );
}

function baselineExistingDatabase() {
  const migrationFolders = listMigrationFolders();

  if (migrationFolders.length === 0) {
    throw new Error(
      "[prisma-check] No migrations found under prisma/migrations. Cannot baseline.",
    );
  }

  console.log(
    "[prisma-check] Existing schema has no Prisma migration history. Baseline in progress...",
  );

  for (const migrationName of migrationFolders) {
    runPrismaStep(`Mark migration as applied: ${migrationName}`, [
      "migrate",
      "resolve",
      "--applied",
      migrationName,
    ]);
  }
}

function isP3005(result) {
  const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  return combinedOutput.includes("P3005");
}

try {
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new Error(
      "DATABASE_URL or DIRECT_URL must be set before running Prisma deploy checks.",
    );
  }

  runPrismaStep("Generate Prisma Client", ["generate"]);

  const migrateDeploy = runPrismaStep("Apply migrations", ["migrate", "deploy"], {
    allowFailure: true,
  });

  if (migrateDeploy.status !== 0) {
    if (!isP3005(migrateDeploy)) {
      throw new Error("[prisma-check] Apply migrations failed.");
    }

    console.log(
      "[prisma-check] Detected P3005 (existing non-empty DB without migration history).",
    );

    const safeToBaseline = databaseMatchesSchema();

    if (!safeToBaseline) {
      throw new Error(
        [
          "[prisma-check] Database schema does not match prisma/schema.prisma, so auto-baseline is unsafe.",
          "Run an explicit migration reconciliation first (do not skip this check).",
        ].join(" "),
      );
    }

    baselineExistingDatabase();
    runPrismaStep("Apply migrations after baseline", ["migrate", "deploy"]);
  }

  runPrismaStep("Validate migration status", ["migrate", "status"]);

  console.log("\n[prisma-check] Prisma schema, migrations, and client are in sync.");
} catch (error) {
  console.error("\n[prisma-check] FAILED");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
