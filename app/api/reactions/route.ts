import { NextResponse } from "next/server";

// Mock reactions API — returns mock response
// Replace with Prisma queries once database is properly configured

export async function POST() {
  // Mock toggle — always returns CREATED
  return NextResponse.json({ status: "CREATED" });
}
