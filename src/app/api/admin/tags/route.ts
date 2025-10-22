import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { tagSchema } from "@/lib/validations"
import { logActivity } from "@/lib/activity-logger"

/**
 * GET /api/admin/tags
 * Tüm etiketleri listeler (plan sayısı ile birlikte)
 * Requirements: 6.7
 */
export async function GET() {
  try {
    await requireAdmin()

    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { plans: true },
        },
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    console.error("Etiketler yüklenirken hata:", error)
    return NextResponse.json(
      { error: "Etiketler yüklenemedi" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/tags
 * Yeni etiket oluşturur
 * Requirements: 6.7
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    // Validasyon
    const validatedData = tagSchema.parse(body)

    // Slug benzersizliği kontrolü
    const existingSlug = await prisma.tag.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Name benzersizliği kontrolü
    const existingName = await prisma.tag.findUnique({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return NextResponse.json(
        { error: "Bu etiket adı zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
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
      type: "TAG_CREATED",
      description: `"${tag.name}" etiketi oluşturuldu`,
      targetId: tag.id,
      targetType: "Tag",
      metadata: { tagName: tag.name, slug: tag.slug },
      request,
    })

    return NextResponse.json(tag, { status: 201 })
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

    console.error("Etiket oluşturulurken hata:", error)
    return NextResponse.json(
      { error: "Etiket oluşturulamadı" },
      { status: 500 }
    )
  }
}
