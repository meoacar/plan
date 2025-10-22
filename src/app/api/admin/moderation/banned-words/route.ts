import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { logActivity } from "@/lib/activity-logger"
import { z } from "zod"

const bannedWordSchema = z.object({
  word: z.string().min(2).max(50).toLowerCase(),
})

/**
 * GET /api/admin/moderation/banned-words
 * Yasaklı kelimeleri listeler
 * Requirements: 4.2
 */
export async function GET() {
  try {
    await requireAdmin()

    const bannedWords = await prisma.bannedWord.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ bannedWords })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    console.error("Banned words GET error:", error)
    return NextResponse.json(
      { error: "Yasaklı kelimeler yüklenirken hata oluştu" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/moderation/banned-words
 * Yeni yasaklı kelime ekler
 * Requirements: 4.3
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    // Validasyon
    const validation = bannedWordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { word } = validation.data

    // Kelime zaten var mı kontrol et
    const existing = await prisma.bannedWord.findUnique({
      where: { word },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Bu kelime zaten yasaklı listede" },
        { status: 400 }
      )
    }

    // Yasaklı kelime oluştur
    const bannedWord = await prisma.bannedWord.create({
      data: {
        word,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "SETTINGS_UPDATED",
      description: `Yasaklı kelime eklendi: ${word}`,
      targetId: bannedWord.id,
      targetType: "BannedWord",
      metadata: { word },
      request,
    })

    return NextResponse.json({ bannedWord }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    console.error("Banned word POST error:", error)
    return NextResponse.json(
      { error: "Yasaklı kelime eklenirken hata oluştu" },
      { status: 500 }
    )
  }
}
