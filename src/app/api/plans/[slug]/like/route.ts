import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addXP, checkBadges, XP_REWARDS } from "@/lib/gamification"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const { slug } = await params;

    // Slug'dan plan ID'sini bul
    const plan = await prisma.plan.findUnique({
      where: { slug },
      select: { id: true, userId: true }
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Plan bulunamadı" },
        { status: 404 }
      )
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        planId_userId: {
          planId: plan.id,
          userId: session.user.id,
        }
      }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.like.create({
        data: {
          planId: plan.id,
          userId: session.user.id,
        }
      })

      // Gamification: Beğeni veren kullanıcıya XP
      await addXP(session.user.id, XP_REWARDS.LIKE_GIVEN, "Plan beğenildi");

      // Gamification: Plan sahibine XP ve rozet kontrolü
      if (plan.userId !== session.user.id) {
        await addXP(plan.userId, XP_REWARDS.LIKE_RECEIVED, "Plan beğeni aldı");
        await checkBadges(plan.userId);
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Beğeni işlemi başarısız" },
      { status: 500 }
    )
  }
}
