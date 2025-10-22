"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}

type CategoryWithCount = Category & {
  _count: { plans: number }
}

interface CategoryManagerProps {
  initialCategories: CategoryWithCount[]
  onUpdate: () => void
}

/**
 * Kategori yönetimi component'i
 * Drag-and-drop ile sıralama, ekleme, düzenleme, silme
 * Requirements: 6.2, 6.8, 6.10
 */
export function CategoryManager({
  initialCategories,
  onUpdate,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id)
      const newIndex = categories.findIndex((cat) => cat.id === over.id)

      const newCategories = arrayMove(categories, oldIndex, newIndex)
      setCategories(newCategories)

      // API'ye sıralama güncelleme isteği gönder
      try {
        const response = await fetch("/api/admin/categories/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryIds: newCategories.map((cat) => cat.id),
          }),
        })

        if (!response.ok) {
          throw new Error("Sıralama güncellenemedi")
        }

        onUpdate()
      } catch (error) {
        console.error("Sıralama hatası:", error)
        // Hata durumunda eski sıralamaya geri dön
        setCategories(initialCategories)
      }
    }
  }

  const handleDelete = async (category: CategoryWithCount) => {
    if (
      !confirm(
        `"${category.name}" kategorisini silmek istediğinize emin misiniz?${
          category._count.plans > 0
            ? `\n\n${category._count.plans} plan kategorisiz yapılacak.`
            : ""
        }`
      )
    ) {
      return
    }

    setIsDeleting(category.id)

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Kategori silinemedi")
      }

      setCategories(categories.filter((cat) => cat.id !== category.id))
      onUpdate()
    } catch (error) {
      console.error("Silme hatası:", error)
      alert(error instanceof Error ? error.message : "Kategori silinemedi")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kategoriler</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori
        </button>
      </div>

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose()
            onUpdate()
          }}
        />
      )}

      <div className="rounded-lg border bg-white">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((cat) => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y">
              {categories.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  isDeleting={isDeleting === category.id}
                  onEdit={() => handleEdit(category)}
                  onDelete={() => handleDelete(category)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {categories.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Henüz kategori eklenmemiş
          </div>
        )}
      </div>
    </div>
  )
}

function SortableCategoryItem({
  category,
  isDeleting,
  onEdit,
  onDelete,
}: {
  category: CategoryWithCount
  isDeleting: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 hover:bg-gray-50"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div
        className="h-8 w-8 rounded"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex-1">
        <div className="font-medium">{category.name}</div>
        <div className="text-sm text-gray-500">
          {category.slug} • {category._count.plans} plan
        </div>
      </div>

      {category.description && (
        <div className="max-w-md text-sm text-gray-600">
          {category.description}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="rounded p-2 text-blue-600 hover:bg-blue-50"
          title="Düzenle"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
          title="Sil"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function CategoryForm({
  category,
  onClose,
  onSuccess,
}: {
  category: CategoryWithCount | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    color: category?.color || "#4caf50",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories"
      const method = category ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.issues) {
          const newErrors: Record<string, string> = {}
          data.issues.forEach((issue: any) => {
            newErrors[issue.path[0]] = issue.message
          })
          setErrors(newErrors)
        } else {
          throw new Error(data.error || "İşlem başarısız")
        }
        return
      }

      onSuccess()
    } catch (error) {
      console.error("Form hatası:", error)
      alert(error instanceof Error ? error.message : "İşlem başarısız")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setFormData({ ...formData, slug })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6">
        <h3 className="mb-4 text-xl font-bold">
          {category ? "Kategori Düzenle" : "Yeni Kategori"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Kategori Adı
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="flex-1 rounded-lg border px-3 py-2"
                required
              />
              <button
                type="button"
                onClick={generateSlug}
                className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Oluştur
              </button>
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Renk</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="h-10 w-20 cursor-pointer rounded-lg border"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="flex-1 rounded-lg border px-3 py-2"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
