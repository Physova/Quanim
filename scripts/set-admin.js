import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const email = process.argv[2] || "shubhadeepr2010@gmail.com";

const user = await p.user.update({
  where: { email },
  data: { role: "ADMIN" },
});
console.log("✅ Updated:", user.email, "-> ADMIN");
await p.$disconnect();
process.exit(0);
