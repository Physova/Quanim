import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Starting production database cleanup...");

  try {
    // We delete in order of dependencies (child first)
    
    console.log("- Deleting Reactions...");
    await prisma.reaction.deleteMany({});
    
    console.log("- Deleting ConfusedReactions...");
    await prisma.confusedReaction.deleteMany({});
    
    console.log("- Deleting Comments...");
    await prisma.comment.deleteMany({});
    
    console.log("- Deleting Threads...");
    await prisma.thread.deleteMany({});
    
    console.log("- Deleting CompletedArticles...");
    await prisma.completedArticle.deleteMany({});
    
    console.log("- Deleting SimStates...");
    await prisma.simState.deleteMany({});

    console.log("✅ Cleanup complete. All user interactions removed.");
    console.log("ℹ️ Note: User accounts and published Articles were preserved.");

  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
