#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "node_modules",
  "out",
]);

const FRAMER_MOTION_IMPORT_PATTERN =
  /(?:\bimport\s+[\s\S]*?\bfrom\s*["']framer-motion["']|\bimport\(\s*["']framer-motion["']\s*\))/m;
const LEADING_TRIVIA_PATTERN = /^(?:\uFEFF)?(?:\s|\/\/[^\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/)*/;
const USE_CLIENT_DIRECTIVE_PATTERN = /^(['"])use client\1\s*;?(?:\r?\n|$)/;

function collectSourceFiles(directory) {
  const files = [];
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      files.push(...collectSourceFiles(absolutePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!SOURCE_EXTENSIONS.has(extname(entry.name))) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function hasUseClientDirective(source) {
  const leadingTrivia = source.match(LEADING_TRIVIA_PATTERN)?.[0] ?? "";
  const remainder = source.slice(leadingTrivia.length);
  return USE_CLIENT_DIRECTIVE_PATTERN.test(remainder);
}

const files = collectSourceFiles(ROOT);
const violations = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");

  if (!FRAMER_MOTION_IMPORT_PATTERN.test(source)) {
    continue;
  }

  if (!hasUseClientDirective(source)) {
    violations.push(relative(ROOT, file));
  }
}

if (violations.length > 0) {
  console.error(
    "[framer-motion-check] Found framer-motion usage in files missing a top-level \"use client\" directive:",
  );
  for (const file of violations) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log(`[framer-motion-check] OK (${files.length} source files scanned).`);
