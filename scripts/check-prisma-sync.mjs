#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function runStep(label, command, args) {
  console.log(`\n[prisma-check] ${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    const status = result.status ?? 1;
    throw new Error(`[prisma-check] ${label} failed with exit code ${status}`);
  }
}

try {
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new Error(
      "DATABASE_URL or DIRECT_URL must be set before running Prisma deploy checks.",
    );
  }

  runStep("Generate Prisma Client", "npx", ["prisma", "generate"]);
  runStep("Apply migrations", "npx", ["prisma", "migrate", "deploy"]);
  runStep("Validate migration status", "npx", ["prisma", "migrate", "status"]);

  console.log("\n[prisma-check] Prisma schema, migrations, and client are in sync.");
} catch (error) {
  console.error("\n[prisma-check] FAILED");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
