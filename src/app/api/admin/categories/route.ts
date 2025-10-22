import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { categorySchema } from "@/lib/validations"
import { logActivity } from "@/lib/activity-logger"

/**
 * GET /api/admin/categories
 * Tüm kategorileri listeler (plan sayısı ile birlikte)
 * Requirements: 6.1
 */
export async function GET() {
  try {
    await requireAdmin()

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { plans: true },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    console.error("Kategoriler yüklenirken hata:", error)
    return NextResponse.json(
      { error: "Kategoriler yüklenemedi" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/categories
 * Yeni kategori oluşturur
 * Requirements: 6.3
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    // Validasyon
    const validatedData = categorySchema.parse(body)

    // Slug benzersizliği kontrolü
    const existingSlug = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Name benzersizliği kontrolü
    const existingName = await prisma.category.findUnique({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return NextResponse.json(
        { error: "Bu kategori adı zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // En yüksek order değerini bul
    const maxOrder = await prisma.category.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        order: (maxOrder?.order ?? -1) + 1,
      },
      include: {
        _count: {
          select: { plans: true },
        },
      },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "CATEGORY_CREATED",
      description: `"${category.name}" kategorisi oluşturuldu`,
      targetId: category.id,
      targetType: "Category",
      metadata: { categoryName: category.name, slug: category.slug },
      request,
    })

    return NextResponse.json(category, { status: 201 })
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

    console.error("Kategori oluşturulurken hata:", error)
    return NextResponse.json(
      { error: "Kategori oluşturulamadı" },
      { status: 500 }
    )
  }
}
