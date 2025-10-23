import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ liked: false })
    }

    const { slug } = await params

    const plan = await prisma.plan.findUnique({
      where: { slug },
      select: { id: true }
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

    return NextResponse.json({ liked: !!existingLike })
  } catch (error) {
    console.error("Like status error:", error)
    return NextResponse.json({ liked: false })
  }
}
