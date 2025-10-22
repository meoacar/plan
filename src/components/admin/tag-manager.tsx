"use client"

import { useState } from "react"
import { Plus, Trash2, Tag as TagIcon } from "lucide-react"

type Tag = {
  id: string
  name: string
  slug: string
  createdAt: Date
}

type TagWithCount = Tag & {
  _count: { plans: number }
}

interface TagManagerProps {
  initialTags: TagWithCount[]
  onUpdate: () => void
}

/**
 * Etiket yönetimi component'i
 * Ekleme, silme, plan sayısı gösterimi
 * Requirements: 6.6, 6.9
 */
export function TagManager({ initialTags, onUpdate }: TagManagerProps) {
  const [tags, setTags] = useState(initialTags)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (tag: TagWithCount) => {
    if (
      !confirm(
        `"${tag.name}" etiketini silmek istediğinize emin misiniz?${
          tag._count.plans > 0
            ? `\n\n${tag._count.plans} plandan kaldırılacak.`
            : ""
        }`
      )
    ) {
      return
    }

    setIsDeleting(tag.id)

    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Etiket silinemedi")
      }

      setTags(tags.filter((t) => t.id !== tag.id))
      onUpdate()
    } catch (error) {
      console.error("Silme hatası:", error)
      alert(error instanceof Error ? error.message : "Etiket silinemedi")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Etiketler</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Etiket
        </button>
      </div>

      {isFormOpen && (
        <TagForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false)
            onUpdate()
          }}
        />
      )}

      <div className="rounded-lg border bg-white">
        <div className="divide-y">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <TagIcon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="font-medium">{tag.name}</div>
                <div className="text-sm text-gray-500">
                  {tag.slug} • {tag._count.plans} plan
                </div>
              </div>

              <button
                onClick={() => handleDelete(tag)}
                disabled={isDeleting === tag.id}
                className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Henüz etiket eklenmemiş
          </div>
        )}
      </div>
    </div>
  )
}

function TagForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
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
        <h3 className="mb-4 text-xl font-bold">Yeni Etiket</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Etiket Adı
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
