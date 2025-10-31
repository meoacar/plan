import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const features = await prisma.promoFeature.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    const feature = await prisma.promoFeature.create({
      data: {
        icon: data.icon,
        title: data.title,
        description: data.description,
        color: data.color || "#10b981",
        order: data.order || 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Promo feature create error:", error);
    return NextResponse.json(
      { error: "Özellik oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
