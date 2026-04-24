import "dotenv/config";
import { Role } from "@prisma/client";
import prisma from "../lib/prisma";

async function main() {
  console.log("Start seeding...");

  // 1. Seed Mock Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@physova.com" },
    update: {},
    create: {
      email: "admin@physova.com",
      name: "Physova Admin",
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@physova.com" },
    update: {},
    create: {
      email: "user@physova.com",
      name: "Curious Student",
      role: Role.USER,
    },
  });

  console.log({ admin, user });

  // 2. Seed Article stubs — Article model only tracks slug + viewCount.
  // All content (title, description, tags, etc.) lives in MDX files on the filesystem.
  const articleSlugs = ["double-slit", "entanglement", "superposition"];

  for (const slug of articleSlugs) {
    const article = await prisma.article.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
    console.log(`Upserted article stub: ${article.slug}`);
  }

  // 3. Seed a verification comment on double-slit
  const dsArticle = await prisma.article.findUnique({
    where: { slug: "double-slit" },
  });

  if (dsArticle) {
    // Use createMany with skipDuplicates to avoid re-seeding
    await prisma.comment.create({
      data: {
        body: "This is a fascinating topic! The wave-particle duality never stops being mind-bending.",
        authorId: user.id,
        articleId: dsArticle.id,
      },
    });
    console.log("Created verification comment on double-slit.");
  }

  // 4. Seed a Community Thread
  await prisma.thread.upsert({
    where: { id: "global-discussion" },
    update: {},
    create: {
      id: "global-discussion",
      title: "General Physics Discussion",
      content: "Discuss anything physics-related with the Physova community.",
      authorId: admin.id,
    },
  });
  console.log("Upserted global thread.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
