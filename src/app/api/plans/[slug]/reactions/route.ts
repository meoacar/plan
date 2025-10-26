import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Global prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Session kontrolü - basit versiyon
    const authHeader = req.headers.get("cookie")
    if (!authHeader) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 })
    }

    const body = await req.json()
    const { emoji, label, userId } = body

    if (!emoji || !label || !userId) {
      return NextResponse.json(
        { error: "Eksik bilgi" },
        { status: 400 }
      )
    }

    const { slug } = await context.params

    // Planı bul
    const plan = await prisma.plan.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 })
    }

    // Mevcut reaksiyonu kontrol et
    const existing = await prisma.planReaction.findFirst({
      where: {
        planId: plan.id,
        userId: userId,
        emoji: emoji,
      },
    })

    let action = "added"

    if (existing) {
      // Kaldır
      await prisma.planReaction.delete({
        where: { id: existing.id },
      })
      action = "removed"
    } else {
      // Ekle
      await prisma.planReaction.create({
        data: {
          planId: plan.id,
          userId: userId,
          emoji: emoji,
          label: label,
        },
      })
    }

    return NextResponse.json({ success: true, action })
  } catch (error: any) {
    console.error("Reaction error:", error)
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: 500 }
    )
  }
}
