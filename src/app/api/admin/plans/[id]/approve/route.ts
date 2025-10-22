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

    const { id } = await params
    const plan = await prisma.plan.update({
      where: { id },
      data: { status: "APPROVED" },
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
      type: "PLAN_APPROVED",
      description: `"${plan.title}" planı onaylandı`,
      targetId: planId,
      targetType: "Plan",
      metadata: {
        planTitle: plan.title,
        planSlug: plan.slug,
        planAuthor: plan.user.name || plan.user.email,
      },
      request: req,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Plan approval error:", error)
    return NextResponse.json(
      { error: "Plan onaylanamadı" },
      { status: 500 }
    )
  }
}
