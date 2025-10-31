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
      { error: "Kullanıcı hikayeleri yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
