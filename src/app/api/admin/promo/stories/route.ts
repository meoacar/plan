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

    const stories = await prisma.userStory.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    const story = await prisma.userStory.create({
      data: {
        name: data.name,
        beforeImage: data.beforeImage,
        afterImage: data.afterImage,
        beforeWeight: data.beforeWeight,
        afterWeight: data.afterWeight,
        duration: data.duration,
        story: data.story,
        quote: data.quote,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        order: data.order || 0,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("User story create error:", error);
    return NextResponse.json(
      { error: "Hikaye oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
