import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { emoji, label } = await req.json()

    if (!emoji || !label) {
      return NextResponse.json(
        { error: "Emoji ve label gerekli" },
        { status: 400 }
      )
    }

    const { slug } = await params

    // Planı bul
    const plan = await prisma.plan.findUnique({
      where: { slug },
      select: { id: true, userId: true, title: true },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 })
    }

    // Mevcut reaksiyonu kontrol et
    const existingReaction = await prisma.planReaction.findUnique({
      where: {
        planId_userId_emoji: {
          planId: plan.id,
          userId: session.user.id,
          emoji,
        },
      },
    })

    let action: "added" | "removed"

    if (existingReaction) {
      // Reaksiyonu kaldır
      await prisma.planReaction.delete({
        where: { id: existingReaction.id },
      })
      action = "removed"
    } else {
      // Reaksiyon ekle
      await prisma.planReaction.create({
        data: {
          planId: plan.id,
          userId: session.user.id,
          emoji,
          label,
        },
      })
      action = "added"

      // Bildirim gönder (kendi planına reaksiyon vermediyse)
      if (plan.userId !== session.user.id) {
        await createNotification({
          userId: plan.userId,
          type: "PLAN_REACTION",
          title: `${emoji} ${label}`,
          message: `${session.user.name} planınıza "${label}" reaksiyonu verdi`,
          actionUrl: `/plan/${slug}`,
          actorId: session.user.id,
          relatedId: plan.id,
        })
      }
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error("Plan reaction error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
