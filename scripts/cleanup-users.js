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
  // 1. Ensure Admin
  const admin = await p.user.update({
    where: { email: 'shubhadeepr2010@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log("Admin verified:", admin.email, "Role:", admin.role);

  // 2. Delete Test User
  const testEmail = 'sb240229@birlahighschool.com';
  const testUser = await p.user.findUnique({ where: { email: testEmail } });
  
  if (testUser) {
    // Delete comments first to avoid foreign key issues
    await p.comment.deleteMany({ where: { authorId: testUser.id } });
    await p.user.delete({ where: { id: testUser.id } });
    console.log("Test account deleted:", testEmail);
  } else {
    console.log("Test account not found:", testEmail);
  }

  await p.$disconnect();
  await pool.end();
}

main().catch(console.error);
