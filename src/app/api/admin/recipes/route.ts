import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";

// Admin: Tüm tarifleri listele (bekleyen, onaylı, reddedilmiş)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: [
          { status: "asc" }, // PENDING önce
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin tarif listesi hatası:", error);
    return NextResponse.json(
      { error: "Tarifler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
