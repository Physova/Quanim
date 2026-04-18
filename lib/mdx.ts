import fs from "fs";
import path from "path";

export interface TopicFrontmatter {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  publishedAt: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export function getTopicSlugs() {
  if (typeof window !== "undefined") {
    throw new Error("getTopicSlugs can only be used on the server.");
  }
  const TOPICS_PATH = path.join(process.cwd(), "content/topics");
  return fs.readdirSync(TOPICS_PATH).filter((path) => /\.mdx?$/.test(path));
}

export function getTopicBySlug(slug: string) {
  if (typeof window !== "undefined") {
    throw new Error("getTopicBySlug can only be used on the server.");
  }
  const TOPICS_PATH = path.join(process.cwd(), "content/topics");
  const realSlug = slug.replace(/\.mdx?$/, "");
  const fullPath = path.join(TOPICS_PATH, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Simple frontmatter parser
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = fileContents.match(frontmatterRegex);
  
  let frontmatter = {
    title: "",
    slug: realSlug,
    description: "",
    tags: [],
    publishedAt: "",
    difficulty: "Beginner"
  } as TopicFrontmatter;
  let content = fileContents;

  if (match) {
    const yamlPart = match[1];
    content = fileContents.replace(frontmatterRegex, "").trim();
    
    const lines = yamlPart.split("\n");
    lines.forEach(line => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex !== -1) {
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");
        
        if (key === "tags") {
          frontmatter.tags = value.replace(/[\[\]]/g, "").split(",").map(t => t.trim().replace(/^"(.*)"$/, "$1"));
        } else if (key === "title") {
          frontmatter.title = value;
        } else if (key === "description") {
          frontmatter.description = value;
        } else if (key === "publishedAt") {
          frontmatter.publishedAt = value;
        } else if (key === "difficulty") {
          frontmatter.difficulty = value as any;
        }
      }
    });
  }

  return { frontmatter, content };
}

export function getAllTopics() {
  if (typeof window !== "undefined") {
    throw new Error("getAllTopics can only be used on the server.");
  }
  const slugs = getTopicSlugs();
  const topics = slugs
    .map((slug) => getTopicBySlug(slug).frontmatter)
    .sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1));
  return topics;
}
