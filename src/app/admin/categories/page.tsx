import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CategoriesClient } from "./categories-client"

/**
 * Admin Kategoriler ve Etiketler Sayfası
 * Requirements: 6.1, 6.5
 */
export default async function AdminCategoriesPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Kategorileri getir
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { Plan: true },
      },
    },
  })

  // Etiketleri getir
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { PlanTag: true },
      },
    },
  })

  return <CategoriesClient categories={categories} tags={tags} />
}


