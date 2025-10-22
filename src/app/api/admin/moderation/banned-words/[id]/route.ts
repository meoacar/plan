import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { logActivity } from "@/lib/activity-logger"

/**
 * DELETE /api/admin/moderation/banned-words/[id]
 * Yasaklı kelimeyi siler
 * Requirements: 4.3
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const { id } = params

    // Yasaklı kelimeyi bul
    const bannedWord = await prisma.bannedWord.findUnique({
      where: { id },
    })

    if (!bannedWord) {
      return NextResponse.json(
        { error: "Yasaklı kelime bulunamadı" },
        { status: 404 }
      )
    }

    // Sil
    await prisma.bannedWord.delete({
      where: { id },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "SETTINGS_UPDATED",
      description: `Yasaklı kelime silindi: ${bannedWord.word}`,
      targetId: id,
      targetType: "BannedWord",
      metadata: { word: bannedWord.word },
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    console.error("Banned word DELETE error:", error)
    return NextResponse.json(
      { error: "Yasaklı kelime silinirken hata oluştu" },
      { status: 500 }
    )
  }
}
