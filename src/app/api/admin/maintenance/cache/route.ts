import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { logActivity } from "@/lib/activity-logger"
import { revalidatePath } from "next/cache"

/**
 * DELETE /api/admin/maintenance/cache
 * Cache'i temizler
 * Requirements: 11.5
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()

    // Tüm önemli path'leri revalidate et
    const pathsToRevalidate = [
      "/",
      "/admin",
      "/admin/analytics",
      "/admin/plans",
      "/admin/users",
      "/admin/comments",
      "/admin/categories",
      "/admin/settings",
      "/plan/[slug]",
      "/profile/[id]",
    ]

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path)
      } catch (error) {
        console.error(`Path revalidation hatası (${path}):`, error)
      }
    }

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "CACHE_CLEARED",
      description: "Sistem cache'i temizlendi",
      request,
    })

    return NextResponse.json({
      success: true,
      message: "Cache başarıyla temizlendi",
    })
  } catch (error) {
    console.error("Cache temizleme hatası:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Cache temizlenemedi" },
      { status: 500 }
    )
  }
}
