import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      publishedAt,
    } = body

    // Slug kontrolü (kendi ID'si hariç)
    const existingPage = await prisma.page.findFirst({
      where: {
        slug,
        NOT: { id: params.id },
      },
    })

    if (existingPage) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const page = await prisma.page.update({
      where: { id: params.id },
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
        publishedAt: publishedAt ? new Date(publishedAt) : (isPublished ? new Date() : null),
      },
    })

    await logActivity({
      userId: session.user.id,
      type: "SETTINGS_UPDATED",
      description: `Sayfa güncellendi: ${title}`,
      targetId: page.id,
      targetType: "page",
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json(
      { error: "Sayfa güncellenemedi" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const page = await prisma.page.findUnique({
      where: { id: params.id },
    })

    if (!page) {
      return NextResponse.json(
        { error: "Sayfa bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.page.delete({
      where: { id: params.id },
    })

    await logActivity({
      userId: session.user.id,
      type: "SETTINGS_UPDATED",
      description: `Sayfa silindi: ${page.title}`,
      targetId: page.id,
      targetType: "page",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json(
      { error: "Sayfa silinemedi" },
      { status: 500 }
    )
  }
}
