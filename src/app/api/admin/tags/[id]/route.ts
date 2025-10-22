import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { logActivity } from "@/lib/activity-logger"

/**
 * DELETE /api/admin/tags/[id]
 * Etiketi siler ve ilişkili PlanTag kayıtlarını da siler (cascade)
 * Requirements: 6.7
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Etiket var mı kontrol et
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { plans: true },
        },
      },
    })

    if (!tag) {
      return NextResponse.json(
        { error: "Etiket bulunamadı" },
        { status: 404 }
      )
    }

    // Etiketi sil (PlanTag ilişkileri cascade ile otomatik silinir)
    await prisma.tag.delete({
      where: { id },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "TAG_DELETED",
      description: `"${tag.name}" etiketi silindi (${tag._count.plans} plandan kaldırıldı)`,
      targetId: tag.id,
      targetType: "Tag",
      metadata: { 
        tagName: tag.name,
        affectedPlansCount: tag._count.plans,
      },
      request,
    })

    return NextResponse.json({ 
      success: true,
      message: "Etiket başarıyla silindi",
      affectedPlansCount: tag._count.plans,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }

    console.error("Etiket silinirken hata:", error)
    return NextResponse.json(
      { error: "Etiket silinemedi" },
      { status: 500 }
    )
  }
}
