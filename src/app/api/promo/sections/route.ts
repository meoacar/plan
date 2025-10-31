import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sections = await prisma.promoSection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Promo sections fetch error:", error);
    return NextResponse.json(
      { error: "Bölümler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
