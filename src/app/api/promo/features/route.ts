import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const features = await prisma.promoFeature.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error("Promo features fetch error:", error);
    return NextResponse.json(
      { error: "Özellikler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
