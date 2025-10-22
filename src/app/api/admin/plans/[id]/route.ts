import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"
import { addXP, checkBadges, XP_REWARDS } from "@/lib/gamification"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { status } = body

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Geçersiz durum" },
        { status: 400 }
      )
    }

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Gamification: Plan onaylandığında XP ve rozet kontrolü
    if (status === "APPROVED") {
      await addXP(plan.userId, XP_REWARDS.PLAN_APPROVED, "Plan onaylandı");
      await checkBadges(plan.userId);
    }

    // Activity log
    const activityType = status === "APPROVED" ? "PLAN_APPROVED" : "PLAN_REJECTED"
    await logActivity({
      userId: session.user.id,
      type: activityType,
      description: `"${plan.title}" planı ${status === "APPROVED" ? "onaylandı" : "reddedildi"}`,
      targetId: plan.id,
      targetType: "Plan",
      metadata: {
        planTitle: plan.title,
        planSlug: plan.slug,
        planAuthor: plan.user.name || plan.user.email,
        status,
      },
      request: req,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Plan update error:", error)
    return NextResponse.json(
      { error: "Plan güncellenemedi" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    // Plan bilgilerini al (silmeden önce)
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Plan bulunamadı" },
        { status: 404 }
      )
    }

    await prisma.plan.delete({
      where: { id: params.id }
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "PLAN_DELETED",
      description: `"${plan.title}" planı silindi`,
      targetId: plan.id,
      targetType: "Plan",
      metadata: {
        planTitle: plan.title,
        planSlug: plan.slug,
        planAuthor: plan.user.name || plan.user.email,
      },
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Plan delete error:", error)
    return NextResponse.json(
      { error: "Plan silinemedi" },
      { status: 500 }
    )
  }
}
