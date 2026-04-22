import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { simType, params } = await req.json();

    if (!simType || !params) {
      return NextResponse.json({ error: "Missing simType or params" }, { status: 400 });
    }

    const simState = await prisma.simState.create({
      data: {
        simType,
        params,
      },
    });

    return NextResponse.json({ id: simState.id });
  } catch (error) {
    console.error("Error saving sim state:", error);
    return NextResponse.json({ error: "Failed to save state" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const simState = await prisma.simState.findUnique({
      where: { id },
    });

    if (!simState) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    return NextResponse.json(simState);
  } catch (error) {
    console.error("Error retrieving sim state:", error);
    return NextResponse.json({ error: "Failed to retrieve state" }, { status: 500 });
  }
}
