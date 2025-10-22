import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createWallPostSchema = z.object({
  userId: z.string(),
  content: z.string().min(1).max(1000),
  isPublic: z.boolean().optional().default(true),
})

// GET - Bir kullanıcının duvar yazılarını getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!userId) {
      return NextResponse.json(
        { error: "userId parametresi gerekli" },
        { status: 400 }
      )
    }

    const session = await auth()
    const isOwnProfile = session?.user?.id === userId

    // Sayfalama
    const skip = (page - 1) * limit

    // Duvar yazılarını getir
    const [posts, total] = await Promise.all([
      prisma.wallPost.findMany({
        where: {
          userId,
          // Kendi profilinde tüm mesajları göster, başkasının profilinde sadece public olanları
          ...(isOwnProfile ? {} : { isPublic: true }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.wallPost.count({
        where: {
          userId,
          ...(isOwnProfile ? {} : { isPublic: true }),
        },
      }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Wall posts fetch error:", error)
    return NextResponse.json(
      { error: "Duvar yazıları yüklenirken hata oluştu" },
      { status: 500 }
    )
  }
}

// POST - Yeni duvar yazısı oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createWallPostSchema.parse(body)

    // Kullanıcının kendi duvarına yazıp yazmadığını kontrol et
    if (validatedData.userId === session.user.id) {
      return NextResponse.json(
        { error: "Kendi duvarınıza mesaj yazamazsınız" },
        { status: 400 }
      )
    }

    // Hedef kullanıcının var olup olmadığını kontrol et
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Duvar yazısı oluştur
    const wallPost = await prisma.wallPost.create({
      data: {
        userId: validatedData.userId,
        authorId: session.user.id,
        content: validatedData.content,
        isPublic: validatedData.isPublic,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(wallPost, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Wall post creation error:", error)
    return NextResponse.json(
      { error: "Duvar yazısı oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}
