import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const sections = await prisma.promoSection.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    const section = await prisma.promoSection.create({
      data: {
        type: data.type,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        buttonText: data.buttonText,
        buttonUrl: data.buttonUrl,
        order: data.order || 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Promo section create error:", error);
    return NextResponse.json(
      { error: "Bölüm oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
