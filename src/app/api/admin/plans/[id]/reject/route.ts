import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"

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

    const body = await req.json()
    const { reason } = body

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Lütfen en az 10 karakter uzunluğunda bir ret sebebi girin" },
        { status: 400 }
      )
    }

    const { id } = await params
    const plan = await prisma.plan.update({
      where: { id },
      data: { 
        status: "REJECTED",
        rejectionReason: reason.trim()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Activity log
    const { id: planId } = await params
    await logActivity({
      userId: session.user.id,
      type: "PLAN_REJECTED",
      description: `"${plan.title}" planı reddedildi: ${reason.substring(0, 100)}`,
      targetId: planId,
      targetType: "Plan",
      metadata: {
        planTitle: plan.title,
        planSlug: plan.slug,
        planAuthor: plan.user.name || plan.user.email,
        rejectionReason: reason,
      },
      request: req,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Plan rejection error:", error)
    return NextResponse.json(
      { error: "Plan reddedilemedi" },
      { status: 500 }
    )
  }
}
