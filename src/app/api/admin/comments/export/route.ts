import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/comments/export
 * Yorumları CSV formatında dışa aktar
 */
export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            title: true,
            slug: true,
          },
        },
        moderator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // CSV oluştur
    const csvHeader = "ID,Yorum,Yazar,Yazar Email,Plan,Durum,Spam,Moderatör,Moderasyon Notu,Oluşturma Tarihi,Moderasyon Tarihi\n"
    
    const csvRows = comments.map(comment => {
      const row = [
        comment.id,
        `"${comment.body.replace(/"/g, '""')}"`, // CSV escape
        comment.user.name || "Anonim",
        comment.user.email,
        `"${comment.plan.title.replace(/"/g, '""')}"`,
        comment.status,
        comment.isSpam ? "Evet" : "Hayır",
        comment.moderator?.name || "-",
        comment.moderationNote ? `"${comment.moderationNote.replace(/"/g, '""')}"` : "-",
        new Date(comment.createdAt).toLocaleString("tr-TR"),
        comment.moderatedAt ? new Date(comment.moderatedAt).toLocaleString("tr-TR") : "-",
      ]
      return row.join(",")
    })

    const csv = csvHeader + csvRows.join("\n")

    // UTF-8 BOM ekle (Excel için)
    const bom = "\uFEFF"
    const csvWithBom = bom + csv

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="yorumlar-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Comment export error:", error)
    return NextResponse.json(
      { error: "Dışa aktarma başarısız" },
      { status: 500 }
    )
  }
}
