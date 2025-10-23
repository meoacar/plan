import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Kullanıcının alışveriş listelerini getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const planId = searchParams.get("planId")

    const where: any = { userId: session.user.id }
    if (planId) {
      where.planId = planId
    }

    const lists = await prisma.shoppingList.findMany({
      where,
      include: {
        items: {
          orderBy: [{ category: "asc" }, { order: "asc" }]
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ lists })
  } catch (error) {
    console.error("Shopping lists fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Yeni alışveriş listesi oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, planId, weekNumber } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Liste adı gerekli" }, { status: 400 })
    }

    const list = await prisma.shoppingList.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim(),
        planId,
        weekNumber
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({ list })
  } catch (error) {
    console.error("Shopping list create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
