const { spawn } = require("child_process");

/**
 * Cross-platform wrapper for commands that need Prisma engine env vars.
 *
 * Usage:
 *   node scripts/with-prisma-engine.js next dev
 *   node scripts/with-prisma-engine.js next build
 *   node scripts/with-prisma-engine.js next start
 *   node scripts/with-prisma-engine.js prisma generate
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

// Ensure we use npx for prisma if not already specified
const finalCommand = command === "prisma" ? "npx prisma" : command;

const child = spawn(finalCommand, args, {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PRISMA_CLIENT_ENGINE_TYPE: "library",
  },
});

// Add timeout to prevent hangs (10 minutes)
const timeout = setTimeout(() => {
  console.error(`Command timed out after 10 minutes: ${finalCommand} ${args.join(" ")}`);
  child.kill();
  process.exit(1);
}, 10 * 60 * 1000);

child.on("error", (err) => {
  clearTimeout(timeout);
  console.error(`Failed to start child process: ${err}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  clearTimeout(timeout);
  if (typeof code === "number") process.exit(code);
  if (signal) process.exit(1);
  process.exit(1);
});

