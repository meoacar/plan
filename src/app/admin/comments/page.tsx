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
    status?: string
    spam?: string
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
    status?: any
    isSpam?: boolean
  } = {}

  // Durum filtresi
  const statusFilter = params.status
  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter
  }

  // Spam filtresi
  if (params.spam === "true") {
    where.isSpam = true
  }

  // Arama: yorum içeriği, yazar adı veya plan başlığı
  if (search) {
    where.OR = [
      { body: { contains: search, mode: "insensitive" } },
      { User_Comment_userIdToUser: { name: { contains: search, mode: "insensitive" } } },
      { Plan: { title: { contains: search, mode: "insensitive" } } },
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
    | { User_Comment_userIdToUser: { name: "asc" | "desc" } }
    | { Plan: { title: "asc" | "desc" } }
    | { createdAt: "asc" | "desc" }
  
  if (sortBy === "user") {
    orderBy = { User_Comment_userIdToUser: { name: sortOrder as "asc" | "desc" } }
  } else if (sortBy === "plan") {
    orderBy = { Plan: { title: sortOrder as "asc" | "desc" } }
  } else {
    orderBy = { createdAt: sortOrder as "asc" | "desc" }
  }

  // Yorumları getir
  const comments = await prisma.comment.findMany({
    where,
    include: {
      User_Comment_userIdToUser: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      Plan: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      User_Comment_moderatedByToUser: {
        select: {
          name: true,
        },
      },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  // İstatistikler
  const stats = {
    total: await prisma.comment.count(),
    approved: await prisma.comment.count({ where: { status: "APPROVED" } }),
    pending: await prisma.comment.count({ where: { status: "PENDING" } }),
    rejected: await prisma.comment.count({ where: { status: "REJECTED" } }),
    spam: await prisma.comment.count({ where: { isSpam: true } }),
  }

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
        stats={stats}
      />
    </div>
  )
}
