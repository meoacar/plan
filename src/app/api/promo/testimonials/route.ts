import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Testimonials fetch error:", error);
    return NextResponse.json(
      { error: "Referanslar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
