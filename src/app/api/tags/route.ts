import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/tags
 * Public endpoint - Tüm etiketleri listeler
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Etiketler yüklenirken hata:", error)
    return NextResponse.json(
      { error: "Etiketler yüklenemedi" },
      { status: 500 }
    )
  }
}
