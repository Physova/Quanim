import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  const users = await p.user.findMany({
    select: { id: true, email: true, username: true }
  });
  console.log("Current Users:");
  console.table(users);
  await p.$disconnect();
  await pool.end();
}

main();
