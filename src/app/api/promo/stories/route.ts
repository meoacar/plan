import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured") === "true";

    const where = featured 
      ? { isActive: true, isFeatured: true }
      : { isActive: true };

    const stories = await prisma.userStory.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("User stories fetch error:", error);
    return NextResponse.json(
      { error: "Hikayeler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
