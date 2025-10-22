import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { categorySchema } from "@/lib/validations"
import { logActivity } from "@/lib/activity-logger"

/**
 * PATCH /api/admin/categories/[id]
 * Kategoriyi günceller
 * Requirements: 6.4
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    // Kategori var mı kontrol et
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      )
    }

    // Validasyon
    const validatedData = categorySchema.parse(body)

    // Slug benzersizliği kontrolü (kendi ID'si hariç)
    if (validatedData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: params.id },
        },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor" },
          { status: 400 }
        )
      }
    }

    // Name benzersizliği kontrolü (kendi ID'si hariç)
    if (validatedData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name: validatedData.name,
          id: { not: params.id },
        },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: "Bu kategori adı zaten kullanılıyor" },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: { plans: true },
        },
      },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "CATEGORY_UPDATED",
      description: `"${category.name}" kategorisi güncellendi`,
      targetId: category.id,
      targetType: "Category",
      metadata: { 
        categoryName: category.name,
        changes: validatedData,
      },
      request,
    })

    return NextResponse.json(category)
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

    console.error("Kategori güncellenirken hata:", error)
    return NextResponse.json(
      { error: "Kategori güncellenemedi" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Kategoriyi siler ve ilişkili planların categoryId'sini null yapar
 * Requirements: 6.5
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()

    // Kategori var mı kontrol et
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { plans: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      )
    }

    // İlişkili planların categoryId'sini null yap
    if (category._count.plans > 0) {
      await prisma.plan.updateMany({
        where: { categoryId: params.id },
        data: { categoryId: null },
      })
    }

    // Kategoriyi sil
    await prisma.category.delete({
      where: { id: params.id },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "CATEGORY_DELETED",
      description: `"${category.name}" kategorisi silindi (${category._count.plans} plan kategorisiz yapıldı)`,
      targetId: category.id,
      targetType: "Category",
      metadata: { 
        categoryName: category.name,
        affectedPlansCount: category._count.plans,
      },
      request,
    })

    return NextResponse.json({ 
      success: true,
      message: "Kategori başarıyla silindi",
      affectedPlansCount: category._count.plans,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }

    console.error("Kategori silinirken hata:", error)
    return NextResponse.json(
      { error: "Kategori silinemedi" },
      { status: 500 }
    )
  }
}
