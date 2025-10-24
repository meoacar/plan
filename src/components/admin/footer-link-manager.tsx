"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

interface FooterLink {
  id: string
  title: string
  url: string
  order: number
  openInNewTab: boolean
}

interface FooterLinkManagerProps {
  links: FooterLink[]
  settingsId: string
}

export function FooterLinkManager({ links: initialLinks, settingsId }: FooterLinkManagerProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [links, setLinks] = useState<FooterLink[]>(initialLinks)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    openInNewTab: false,
  })

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({ title: "", url: "", openInNewTab: false })
  }

  const handleEdit = (link: FooterLink) => {
    setEditingId(link.id)
    setIsAdding(true)
    setFormData({
      title: link.title,
      url: link.url,
      openInNewTab: link.openInNewTab,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.url) {
      addToast({
        type: "error",
        title: "Hata",
        description: "Başlık ve URL zorunludur",
      })
      return
    }

    try {
      const url = editingId
        ? `/api/admin/footer-links/${editingId}`
        : "/api/admin/footer-links"

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          settingsId,
          order: editingId
            ? links.find((l) => l.id === editingId)?.order
            : links.length,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "İşlem başarısız")
      }

      const savedLink = await response.json()

      if (editingId) {
        setLinks(links.map((l) => (l.id === editingId ? savedLink : l)))
        addToast({
          type: "success",
          title: "Başarılı",
          description: "Link güncellendi",
        })
      } else {
        setLinks([...links, savedLink])
        addToast({
          type: "success",
          title: "Başarılı",
          description: "Link eklendi",
        })
      }

      setIsAdding(false)
      setEditingId(null)
      setFormData({ title: "", url: "", openInNewTab: false })
      router.refresh()
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Hata",
        description: error.message,
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu linki silmek istediğinizden emin misiniz?")) return

    try {
      const response = await fetch(`/api/admin/footer-links/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Silme işlemi başarısız")

      setLinks(links.filter((l) => l.id !== id))
      addToast({
        type: "success",
        title: "Başarılı",
        description: "Link silindi",
      })
      router.refresh()
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Hata",
        description: error.message,
      })
    }
  }

  const moveLink = async (id: string, direction: "up" | "down") => {
    const index = links.findIndex((l) => l.id === id)
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === links.length - 1)
    )
      return

    const newLinks = [...links]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newLinks[index], newLinks[targetIndex]] = [
      newLinks[targetIndex],
      newLinks[index],
    ]

    // Update order
    const updatedLinks = newLinks.map((link, idx) => ({
      ...link,
      order: idx,
    }))

    setLinks(updatedLinks)

    try {
      await fetch("/api/admin/footer-links/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: updatedLinks.map((l) => ({ id: l.id, order: l.order })),
        }),
      })
      router.refresh()
    } catch (error) {
      addToast({
        type: "error",
        title: "Hata",
        description: "Sıralama güncellenemedi",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Footer Linkleri</h3>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#45a049] transition-colors text-sm"
        >
          + Yeni Link Ekle
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Link Başlığı *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ana Sayfa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL *</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="/"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              İç linkler için: / veya /submit | Dış linkler için: https://...
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="openInNewTab"
              checked={formData.openInNewTab}
              onChange={(e) =>
                setFormData({ ...formData, openInNewTab: e.target.checked })
              }
              className="w-4 h-4 text-[#4caf50] rounded focus:ring-2 focus:ring-[#4caf50]"
            />
            <label htmlFor="openInNewTab" className="ml-2 text-sm">
              Yeni sekmede aç
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#45a049] transition-colors text-sm"
            >
              {editingId ? "Güncelle" : "Ekle"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                setFormData({ title: "", url: "", openInNewTab: false })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {links.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Henüz link eklenmemiş
          </p>
        ) : (
          links.map((link, index) => (
            <div
              key={link.id}
              className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{link.title}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{link.url}</span>
                  {link.openInNewTab && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                      Yeni sekme
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveLink(link.id, "up")}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Yukarı taşı"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => moveLink(link.id, "down")}
                  disabled={index === links.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Aşağı taşı"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleEdit(link)}
                  className="px-3 py-1 text-[#4caf50] hover:bg-[#4caf50]/10 rounded text-sm font-medium"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
