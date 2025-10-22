"use client"

import { useRouter } from "next/navigation"
import { CategoryManager } from "@/components/admin/category-manager"
import { TagManager } from "@/components/admin/tag-manager"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
  _count: { plans: number }
}

type Tag = {
  id: string
  name: string
  slug: string
  createdAt: Date
  _count: { plans: number }
}

interface CategoriesClientProps {
  categories: Category[]
  tags: Tag[]
}

export function CategoriesClient({ categories, tags }: CategoriesClientProps) {
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Kategoriler ve Etiketler</h1>
        <p className="mt-2 text-gray-600">
          Planlar için kategori ve etiket yönetimi
        </p>
      </div>

      <CategoryManager
        initialCategories={categories}
        onUpdate={handleUpdate}
      />

      <TagManager initialTags={tags} onUpdate={handleUpdate} />
    </div>
  )
}
