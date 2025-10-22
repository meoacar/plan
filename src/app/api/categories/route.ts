import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/categories
 * Public endpoint - Tüm kategorileri listeler
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        description: true,
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Kategoriler yüklenirken hata:", error)
    return NextResponse.json(
      { error: "Kategoriler yüklenemedi" },
      { status: 500 }
    )
  }
}
