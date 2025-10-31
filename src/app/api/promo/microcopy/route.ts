import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    const where = location 
      ? { isActive: true, location }
      : { isActive: true };

    const microcopies = await prisma.microCopy.findMany({
      where,
      orderBy: { key: "asc" },
    });

    return NextResponse.json(microcopies);
  } catch (error) {
    console.error("Microcopy fetch error:", error);
    return NextResponse.json(
      { error: "Mikro kopyalar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
