import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ALLOWED_EMOJIS = ["💪", "🎉", "❤️", "🔥", "👏"]

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const { emoji } = await req.json()

    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json(
        { error: "Geçersiz emoji" },
        { status: 400 }
      )
    }

    const { id } = await params

    // Yorum var mı kontrol et
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true },
        },
        plan: {
          select: { slug: true, title: true },
        },
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Yorum bulunamadı" },
        { status: 404 }
      )
    }

    // Kullanıcının bu yoruma verdiği tüm reaksiyonları kontrol et
    const existingReactions = await prisma.commentReaction.findMany({
      where: {
        commentId: id,
        userId: session.user.id,
      },
    })

    // Aynı emoji'ye tıklandıysa, reaksiyonu kaldır
    const sameEmojiReaction = existingReactions.find(r => r.emoji === emoji)
    
    if (sameEmojiReaction) {
      // Reaksiyonu kaldır
      await prisma.commentReaction.delete({
        where: { id: sameEmojiReaction.id },
      })

      return NextResponse.json({ 
        success: true, 
        action: "removed",
        emoji,
        removedOthers: false
      })
    } else {
      // Farklı emoji'ye tıklandıysa, önce tüm eski reaksiyonları sil
      if (existingReactions.length > 0) {
        await prisma.commentReaction.deleteMany({
          where: {
            commentId: id,
            userId: session.user.id,
          },
        })
      }

      // Yeni reaksiyonu ekle
      await prisma.commentReaction.create({
        data: {
          commentId: id,
          userId: session.user.id,
          emoji,
        },
      })

      // Yorum sahibine bildirim gönder (kendi yorumuna reaksiyon vermiyorsa)
      if (comment.userId !== session.user.id) {
        try {
          const { createNotification } = await import('@/lib/notifications');
          await createNotification({
            userId: comment.userId,
            type: 'COMMENT_REACTION',
            title: 'Yorumunuza Reaksiyon',
            message: `${session.user.name} yorumunuza ${emoji} reaksiyonu verdi`,
            actionUrl: `/plan/${comment.plan.slug}#comments`,
            actorId: session.user.id,
            relatedId: id,
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        action: "added",
        emoji,
        removedOthers: existingReactions.length > 0
      })
    }
  } catch (error) {
    console.error("Comment reaction error:", error)
    return NextResponse.json(
      { error: "Reaksiyon eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const reactions = await prisma.commentReaction.groupBy({
      by: ["emoji"],
      where: {
        commentId: id,
      },
      _count: {
        emoji: true,
      },
    })

    const session = await auth()
    let userReactions: string[] = []

    if (session?.user) {
      const userReactionRecords = await prisma.commentReaction.findMany({
        where: {
          commentId: id,
          userId: session.user.id,
        },
        select: {
          emoji: true,
        },
      })
      userReactions = userReactionRecords.map((r) => r.emoji)
    }

    return NextResponse.json({
      reactions: reactions.map((r) => ({
        emoji: r.emoji,
        count: r._count.emoji,
      })),
      userReactions,
    })
  } catch (error) {
    console.error("Get reactions error:", error)
    return NextResponse.json(
      { error: "Reaksiyonlar alınırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
