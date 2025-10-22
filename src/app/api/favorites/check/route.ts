import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Planın favorilerde olup olmadığını kontrol et
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ isFavorited: false })
    }

    const { planId } = await req.json()

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID gerekli" },
        { status: 400 }
      )
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        planId_userId: {
          planId,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ 
      isFavorited: !!favorite,
      favoriteId: favorite?.id || null,
    })
  } catch (error) {
    console.error("Favorite check error:", error)
    return NextResponse.json(
      { error: "Kontrol sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
}
