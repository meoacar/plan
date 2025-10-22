import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"

/**
 * POST /api/admin/comments/bulk-delete
 * Toplu yorum silme
 * Requirements: 1.8
 */
export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { commentIds } = body

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz yorum ID listesi" },
        { status: 400 }
      )
    }

    // Yorumları sil
    const result = await prisma.comment.deleteMany({
      where: {
        id: { in: commentIds },
      },
    })

    // Activity log'a kaydet
    await logActivity({
      userId: session.user.id,
      type: "COMMENT_DELETED",
      description: `${result.count} yorum toplu olarak silindi`,
      metadata: {
        commentIds,
        deletedCount: result.count,
      },
      request: req,
    })

    return NextResponse.json({ 
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error("Bulk delete error:", error)
    return NextResponse.json(
      { error: "Yorumlar silinemedi" },
      { status: 500 }
    )
  }
}
