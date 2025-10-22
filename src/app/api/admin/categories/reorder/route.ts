import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { z } from "zod"

const reorderSchema = z.object({
  categoryIds: z.array(z.string()).min(1, "En az bir kategori ID'si gerekli"),
})

/**
 * POST /api/admin/categories/reorder
 * Kategorilerin sırasını günceller
 * Requirements: 6.10
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Validasyon
    const { categoryIds } = reorderSchema.parse(body)

    // Tüm kategorilerin var olduğunu kontrol et
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "Bazı kategoriler bulunamadı" },
        { status: 400 }
      )
    }

    // Her kategori için order değerini güncelle
    await Promise.all(
      categoryIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    // Güncellenmiş kategorileri getir
    const updatedCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { plans: true },
        },
      },
    })

    return NextResponse.json(updatedCategories)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    
    // Zod validation hatası
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Geçersiz veri", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Kategori sıralaması güncellenirken hata:", error)
    return NextResponse.json(
      { error: "Kategori sıralaması güncellenemedi" },
      { status: 500 }
    )
  }
}
