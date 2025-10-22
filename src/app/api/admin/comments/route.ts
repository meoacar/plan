import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/comments
 * Yorumları listeler, arama, filtreleme ve pagination destekler
 * Requirements: 1.1, 1.6
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
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = 20
    const search = searchParams.get("search") || ""
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Filtreleme koşulları
    const where: {
      OR?: Array<{
        body?: { contains: string; mode: "insensitive" }
        user?: { name: { contains: string; mode: "insensitive" } }
        plan?: { title: { contains: string; mode: "insensitive" } }
      }>
      createdAt?: {
        gte?: Date
        lte?: Date
      }
    } = {}

    // Arama: yorum içeriği, yazar adı veya plan başlığı
    if (search) {
      where.OR = [
        { body: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { plan: { title: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Toplam sayı
    const total = await prisma.comment.count({ where })

    // Sıralama
    let orderBy:
      | { user: { name: "asc" | "desc" } }
      | { plan: { title: "asc" | "desc" } }
      | { createdAt: "asc" | "desc" }
    
    if (sortBy === "user") {
      orderBy = { user: { name: sortOrder as "asc" | "desc" } }
    } else if (sortBy === "plan") {
      orderBy = { plan: { title: sortOrder as "asc" | "desc" } }
    } else {
      orderBy = { createdAt: sortOrder as "asc" | "desc" }
    }

    // Yorumları getir
    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        plan: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      comments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error("Comments fetch error:", error)
    return NextResponse.json(
      { error: "Yorumlar getirilemedi" },
      { status: 500 }
    )
  }
}
