import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Kullanıcının favorilerini getir
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        plan: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Favorites fetch error:", error)
    return NextResponse.json(
      { error: "Favoriler yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Favorilere ekle
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const { planId, note } = await req.json()

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID gerekli" },
        { status: 400 }
      )
    }

    // Planın var olduğunu kontrol et
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Plan bulunamadı" },
        { status: 404 }
      )
    }

    // Zaten favorilerde mi kontrol et
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        planId_userId: {
          planId,
          userId: session.user.id,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Bu plan zaten favorilerinizde" },
        { status: 400 }
      )
    }

    // Favorilere ekle
    const favorite = await prisma.favorite.create({
      data: {
        planId,
        userId: session.user.id,
        note: note || null,
      },
    })

    return NextResponse.json({ 
      favorite,
      message: "Plan favorilere eklendi" 
    })
  } catch (error) {
    console.error("Favorite add error:", error)
    return NextResponse.json(
      { error: "Favorilere eklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
