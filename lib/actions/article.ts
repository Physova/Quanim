"use server";

import { prisma } from "@/lib/prisma";

/**
 * Ensures an article exists in the database by its slug.
 * Since articles are primarily stored in MDX files, the DB
 * serves as a way to track interactions like comments and reactions.
 */
export async function ensureArticleExists(slug: string) {
  try {
    const article = await prisma.article.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
    return article;
  } catch (error) {
    console.error(`[ENSURE_ARTICLE_EXISTS_ERROR] for slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Increments the view count for an article.
 */
export async function incrementArticleViews(slug: string) {
  try {
    await prisma.article.upsert({
      where: { slug },
      update: {
        viewCount: { increment: 1 },
      },
      create: {
        slug,
        viewCount: 1,
      },
    });
  } catch (error) {
    console.error(`[INCREMENT_ARTICLE_VIEWS_ERROR] for slug ${slug}:`, error);
  }
}
