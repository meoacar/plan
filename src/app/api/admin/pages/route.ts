import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json(
      { error: "Sayfalar yüklenemedi" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      isPublished,
      showInFooter,
      showInNavbar,
      showInTopNavbar,
      order,
    } = body

    // Slug kontrolü
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    })

    if (existingPage) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogImage: ogImage || null,
        isPublished,
        showInFooter,
        showInNavbar,
        showInTopNavbar,
        order: order || 0,
        createdBy: session.user.id,
        publishedAt: isPublished ? new Date() : null,
      },
    })

    await logActivity({
      userId: session.user.id,
      type: "SETTINGS_UPDATED",
      description: `Yeni sayfa oluşturuldu: ${title}`,
      targetId: page.id,
      targetType: "page",
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error("Error creating page:", error)
    return NextResponse.json(
      { error: "Sayfa oluşturulamadı" },
      { status: 500 }
    )
  }
}
