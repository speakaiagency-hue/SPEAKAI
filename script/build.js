#!/usr/bin/env node
import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// server deps to bundle to reduce openat(2) syscalls
const allowlist = [
  "@google/genai",
  "@neondatabase/serverless",
  "axios",
  "bcrypt",
  "connect-pg-simple",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "pg",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  try {
    await rm("dist", { recursive: true, force: true });

    console.log("🔨 building client...");
    await viteBuild();

    console.log("🔨 building server...");
    const pkgPath = resolve(__dirname, "../package.json");
    const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
    const allDeps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];
    const externals = allDeps.filter((dep) => !allowlist.includes(dep));

    await esbuild({
      entryPoints: ["server/index.ts"],
      platform: "node",
      bundle: true,
      format: "cjs",
      outfile: "dist/index.cjs",
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      minify: true,
      external: externals,
      logLevel: "info",
    });

    console.log("✅ Build complete!");
  } catch (err) {
    console.error("❌ Build failed:", err);
    process.exit(1);
  }
}

buildAll();
