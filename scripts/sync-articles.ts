// scripts/sync-articles.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Error loading .env.local from ${envPath}:`, result.error);
} else {
  console.log(`✅ Loaded .env.local from ${envPath}`);
}

console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

const prisma = new PrismaClient();
const TOPICS_DIR = path.join(process.cwd(), "content/topics");

async function main() {
  console.log("🚀 Starting article sync...");

  if (!fs.existsSync(TOPICS_DIR)) {
    console.error(`❌ Topics directory not found: ${TOPICS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(TOPICS_DIR).filter((f) => f.endsWith(".mdx"));
  console.log(`Found ${files.length} articles in ${TOPICS_DIR}`);

  for (const file of files) {
    const filePath = path.join(TOPICS_DIR, file);
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter } = matter(rawContent);

    // Parse frontmatter (as requested in task, even if not stored in DB yet)
    const slug = frontmatter.slug || file.replace(".mdx", "");
    const title = frontmatter.title || "Untitled";
    const difficulty = frontmatter.difficulty || "";

    console.log(`- ${slug}: "${title}" [${difficulty}]`);

    try {
      // Upsert into Article table (only slug is in the schema currently)
      await prisma.article.upsert({
        where: { slug },
        update: {}, // No metadata in DB yet
        create: { slug },
      });
      console.log(`  ✅ Synced to DB`);
    } catch (error) {
      console.error(`  ❌ Error syncing ${slug}:`, error);
    }
  }

  console.log("\n🏁 Sync complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
