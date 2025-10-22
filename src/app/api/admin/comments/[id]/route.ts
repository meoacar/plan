import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"

/**
 * DELETE /api/admin/comments/[id]
 * Tekil yorum silme
 * Requirements: 1.7
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Yorumu sil
    const comment = await prisma.comment.delete({
      where: { id },
      include: {
        user: { select: { name: true } },
        plan: { select: { title: true } },
      },
    })

    // Activity log'a kaydet
    await logActivity({
      userId: session.user.id,
      type: "COMMENT_DELETED",
      description: `Yorum silindi: "${comment.body.substring(0, 50)}..." (Yazar: ${comment.user.name}, Plan: ${comment.plan.title})`,
      targetId: id,
      targetType: "Comment",
      metadata: {
        commentBody: comment.body,
        userName: comment.user.name,
        planTitle: comment.plan.title,
      },
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Comment delete error:", error)
    return NextResponse.json(
      { error: "Yorum silinemedi" },
      { status: 500 }
    )
  }
}
