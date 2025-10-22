import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ id: string }>
}

// DELETE - Duvar yazısını sil
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 })
    }

    const { id } = await context.params

    // Duvar yazısını bul
    const wallPost = await prisma.wallPost.findUnique({
      where: { id },
    })

    if (!wallPost) {
      return NextResponse.json(
        { error: "Duvar yazısı bulunamadı" },
        { status: 404 }
      )
    }

    // Sadece yazarı veya duvar sahibi silebilir
    const canDelete =
      wallPost.authorId === session.user.id ||
      wallPost.userId === session.user.id

    if (!canDelete) {
      return NextResponse.json(
        { error: "Bu duvar yazısını silme yetkiniz yok" },
        { status: 403 }
      )
    }

    // Sil
    await prisma.wallPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Wall post deletion error:", error)
    return NextResponse.json(
      { error: "Duvar yazısı silinirken hata oluştu" },
      { status: 500 }
    )
  }
}
