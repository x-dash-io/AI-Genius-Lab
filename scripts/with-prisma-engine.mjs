import { spawn } from "node:child_process";

/**
 * Cross-platform wrapper for commands that need Prisma engine env vars.
 *
 * Usage:
 *   node scripts/with-prisma-engine.mjs next dev
 *   node scripts/with-prisma-engine.mjs next build
 *   node scripts/with-prisma-engine.mjs next start
 *   node scripts/with-prisma-engine.mjs prisma generate
 */

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error("Missing command. Example: next | prisma");
  process.exit(1);
}

if (args.length === 0) {
  console.error('Missing command args. Example: "next dev" or "prisma generate"');
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PRISMA_CLIENT_ENGINE_TYPE: "library",
  },
});

child.on("exit", (code, signal) => {
  if (typeof code === "number") {
    process.exit(code);
  }

  if (signal) {
    process.exit(1);
  }

  process.exit(1);
});
