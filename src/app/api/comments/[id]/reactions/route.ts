import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ALLOWED_EMOJIS = ["💪", "🔥", "👏", "❤️", "😊"]

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
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Yorum bulunamadı" },
        { status: 404 }
      )
    }

    // Kullanıcı bu yoruma bu emoji ile daha önce reaksiyon vermiş mi?
    const existingReaction = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId_emoji: {
          commentId: id,
          userId: session.user.id,
          emoji,
        },
      },
    })

    if (existingReaction) {
      // Reaksiyonu kaldır
      await prisma.commentReaction.delete({
        where: { id: existingReaction.id },
      })

      return NextResponse.json({ 
        success: true, 
        action: "removed",
        emoji 
      })
    } else {
      // Reaksiyon ekle
      await prisma.commentReaction.create({
        data: {
          commentId: id,
          userId: session.user.id,
          emoji,
        },
      })

      return NextResponse.json({ 
        success: true, 
        action: "added",
        emoji 
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
