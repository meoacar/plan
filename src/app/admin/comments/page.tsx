import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CommentList } from "@/components/admin/comment-list"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: string
  }>
}

// Disable caching for admin pages
export const dynamic = "force-dynamic"

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const page = parseInt(params.page || "1")
  const pageSize = 20
  const search = params.search || ""
  const startDate = params.startDate
  const endDate = params.endDate
  const sortBy = params.sortBy || "createdAt"
  const sortOrder = params.sortOrder || "desc"

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

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white p-8 rounded-xl mb-8 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">💬 Yorum Yönetimi</h1>
        <p className="text-lg text-white/90">
          Yorumları görüntüleyin, filtreleyin ve yönetin
        </p>
      </div>

      <CommentList
        initialComments={comments}
        total={total}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  )
}
