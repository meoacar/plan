import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { commentSchema } from "@/lib/validations"
import { checkRateLimit, getIdentifier, RATE_LIMITS } from "@/lib/rate-limit"
import { checkContent } from "@/lib/moderation"
import { addXP, checkBadges, XP_REWARDS } from "@/lib/gamification"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    // Rate limiting: 10 comments per minute
    const identifier = getIdentifier(req, session?.user?.id)
    const rateCheck = checkRateLimit(`comment-create:${identifier}`, RATE_LIMITS.COMMENT)
    
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Çok fazla yorum. Lütfen biraz bekleyin." },
        { status: 429 }
      )
    }
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { body: commentBody } = commentSchema.parse(body)
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID gerekli" },
        { status: 400 }
      )
    }

    // İçerik moderasyonu kontrolü
    const moderationResult = await checkContent(commentBody)

    // Yasaklı kelime veya spam varsa yorumu engelle
    if (!moderationResult.isClean) {
      return NextResponse.json(
        { 
          error: "Yorumunuz uygunsuz içerik nedeniyle engellenmiştir.",
          moderationReason: moderationResult.isSpam ? "spam" : "banned-words",
          bannedWords: moderationResult.bannedWords
        },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        planId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        plan: {
          select: {
            userId: true,
            title: true,
            slug: true,
          }
        }
      }
    })

    // Gamification: Yorum yapan kullanıcıya XP
    await addXP(session.user.id, XP_REWARDS.COMMENT_GIVEN, "Yorum yapıldı");
    await checkBadges(session.user.id);

    // Gamification: Plan sahibine XP
    if (comment.plan.userId !== session.user.id) {
      await addXP(comment.plan.userId, XP_REWARDS.COMMENT_RECEIVED, "Plana yorum yapıldı");

      // Bildirim gönder
      try {
        const { createNotification } = await import('@/lib/notifications');
        await createNotification({
          userId: comment.plan.userId,
          type: 'PLAN_COMMENT',
          title: 'Planınıza Yorum Yapıldı',
          message: `${session.user.name} "${comment.plan.title}" planınıza yorum yaptı`,
          actionUrl: `/plan/${comment.plan.slug}#comments`,
          actorId: session.user.id,
          relatedId: comment.id,
        });
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { 
        error: "Yorum eklenirken bir hata oluştu",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const commentId = searchParams.get("id")

    if (!commentId) {
      return NextResponse.json(
        { error: "Yorum ID gerekli" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Yorum bulunamadı" },
        { status: 404 }
      )
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu yorumu silme yetkiniz yok" },
        { status: 403 }
      )
    }

    await prisma.comment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Yorum silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
