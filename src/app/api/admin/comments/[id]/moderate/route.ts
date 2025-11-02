import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"

/**
 * POST /api/admin/comments/[id]/moderate
 * Yorum moderasyonu (onaylama/reddetme/spam işaretleme)
 */
export async function POST(
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
    const body = await req.json()
    const { action, note } = body // action: 'approve', 'reject', 'spam'

    if (!["approve", "reject", "spam"].includes(action)) {
      return NextResponse.json(
        { error: "Geçersiz işlem" },
        { status: 400 }
      )
    }

    const statusMap = {
      approve: "APPROVED",
      reject: "REJECTED",
      spam: "REJECTED"
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        status: statusMap[action as keyof typeof statusMap] as any,
        isSpam: action === "spam",
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
        moderationNote: note || null,
      },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { title: true } },
      },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "COMMENT_DELETED",
      description: `Yorum ${action === "approve" ? "onaylandı" : action === "spam" ? "spam olarak işaretlendi" : "reddedildi"}: "${comment.body.substring(0, 50)}..."`,
      targetId: id,
      targetType: "Comment",
      metadata: {
        action,
        note,
        commentBody: comment.body,
        userName: comment.user.name,
        planTitle: comment.plan.title,
      },
      request: req,
    })

    // Kullanıcıya bildirim gönder (reddedilme durumunda)
    if (action === "reject" || action === "spam") {
      await prisma.notification.create({
        data: {
          userId: comment.userId,
          type: "SYSTEM",
          title: "Yorumunuz Moderasyona Takıldı",
          message: action === "spam" 
            ? "Yorumunuz spam olarak işaretlendi ve kaldırıldı."
            : `Yorumunuz moderasyon tarafından kaldırıldı. ${note ? `Sebep: ${note}` : ""}`,
          link: `/plan/${comment.plan.id}`,
        },
      })
    }

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Comment moderation error:", error)
    return NextResponse.json(
      { error: "Moderasyon işlemi başarısız" },
      { status: 500 }
    )
  }
}
