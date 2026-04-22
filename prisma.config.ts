import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local first (Next.js convention), then .env as fallback.
// dotenv does NOT overwrite existing vars, so .env.local values win.
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
});
