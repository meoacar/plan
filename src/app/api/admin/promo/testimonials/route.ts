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

    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        avatar: data.avatar,
        role: data.role,
        text: data.text,
        rating: data.rating || 5,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Testimonial create error:", error);
    return NextResponse.json(
      { error: "Referans oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
