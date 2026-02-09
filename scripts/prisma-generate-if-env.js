const { existsSync } = require("fs");
const { spawnSync } = require("child_process");

const hasDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

if (!hasDbUrl) {
  process.env.DATABASE_URL = "file:./dev.db";
  console.log("[postinstall] DATABASE_URL not set. Using local sqlite fallback for prisma generate.");
}

if (!existsSync("node_modules/.bin/prisma")) {
  console.log("[postinstall] Prisma CLI not found; skipping generate.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "generate"], { stdio: "inherit" });
process.exit(result.status ?? 0);
