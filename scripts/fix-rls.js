import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const tables = [
  "User",
  "Account",
  "Session",
  "VerificationToken",
  "Article",
  "Comment",
  "Reaction",
  "ConfusedReaction",
  "SimState",
  "Thread",
  "CompletedArticle"
];

async function main() {
  console.log("🔒 Enabling Row Level Security on all tables...");
  
  for (const table of tables) {
    try {
      // Note: We quote the table names because Prisma uses CamelCase which case-sensitive in PG
      await pool.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✅ RLS enabled for table: ${table}`);
    } catch (error) {
      console.error(`❌ Failed to enable RLS for ${table}:`, error.message);
    }
  }

  console.log("\n✨ Database security locked down.");
  await pool.end();
}

main().catch(console.error);
