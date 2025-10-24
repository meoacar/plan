"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

interface Page {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  ogImage: string | null
  isPublished: boolean
  showInFooter: boolean
  showInNavbar: boolean
  showInTopNavbar: boolean
  order: number
  views: number
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

interface PageManagerProps {
  pages: Page[]
  userId: string
}

export function PageManager({ pages, userId }: PageManagerProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    isPublished: false,
    showInFooter: false,
    showInNavbar: false,
    showInTopNavbar: false,
    order: 0,
  })

  const handleCreate = () => {
    setIsCreating(true)
    setEditingPage(null)
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
      isPublished: false,
      showInFooter: false,
      showInNavbar: false,
      showInTopNavbar: false,
      order: 0,
    })
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setIsCreating(true)
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords || "",
      ogImage: page.ogImage || "",
      isPublished: page.isPublished,
      showInFooter: page.showInFooter,
      showInNavbar: page.showInNavbar,
      showInTopNavbar: page.showInTopNavbar,
      order: page.order,
    })
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingPage ? prev.slug : generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.slug || !formData.content) {
      addToast({
        type: "error",
        title: "Hata",
        description: "Başlık, slug ve içerik zorunludur"
      })
      return
    }

    try {
      const url = editingPage
        ? `/api/admin/pages/${editingPage.id}`
        : "/api/admin/pages"

      const response = await fetch(url, {
        method: editingPage ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "İşlem başarısız")
      }

      addToast({
        type: "success",
        title: "Başarılı",
        description: editingPage ? "Sayfa güncellendi" : "Sayfa oluşturuldu"
      })
      setIsCreating(false)
      setEditingPage(null)
      router.refresh()
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Hata",
        description: error.message
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu sayfayı silmek istediğinizden emin misiniz?")) return

    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Silme işlemi başarısız")

      addToast({
        type: "success",
        title: "Başarılı",
        description: "Sayfa silindi"
      })
      router.refresh()
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Hata",
        description: error.message
      })
    }
  }

  const handleTogglePublish = async (page: Page) => {
    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...page,
          isPublished: !page.isPublished,
          publishedAt: !page.isPublished ? new Date() : page.publishedAt,
        }),
      })

      if (!response.ok) throw new Error("İşlem başarısız")

      addToast({
        type: "success",
        title: "Başarılı",
        description: page.isPublished ? "Sayfa yayından kaldırıldı" : "Sayfa yayınlandı"
      })
      router.refresh()
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Hata",
        description: error.message
      })
    }
  }

  if (isCreating) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {editingPage ? "Sayfayı Düzenle" : "Yeni Sayfa Oluştur"}
          </h2>
          <button
            onClick={() => {
              setIsCreating(false)
              setEditingPage(null)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Temel Bilgiler</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /pages/{formData.slug || "sayfa-url"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Özet (Kısa Açıklama)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                İçerik <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent font-mono text-sm"
                placeholder="HTML içerik girebilirsiniz..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML etiketleri kullanabilirsiniz
              </p>
            </div>
          </div>

          {/* SEO Ayarları */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">SEO Ayarları</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Başlık
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaTitle.length}/60 karakter (Boş bırakılırsa sayfa başlığı kullanılır)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Açıklama
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaDescription.length}/160 karakter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Anahtar Kelimeler
              </label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
                placeholder="kelime1, kelime2, kelime3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                OG Image URL
              </label>
              <input
                type="url"
                value={formData.ogImage}
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Görünürlük Ayarları */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Görünürlük Ayarları</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 text-[#4caf50] rounded focus:ring-2 focus:ring-[#4caf50]"
                />
                <span className="font-medium">Yayınla</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.showInTopNavbar}
                  onChange={(e) => setFormData({ ...formData, showInTopNavbar: e.target.checked })}
                  className="w-5 h-5 text-[#4caf50] rounded focus:ring-2 focus:ring-[#4caf50]"
                />
                <span>Üst Navbar'da Göster</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.showInNavbar}
                  onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                  className="w-5 h-5 text-[#4caf50] rounded focus:ring-2 focus:ring-[#4caf50]"
                />
                <span>Navbar'da Göster</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.showInFooter}
                  onChange={(e) => setFormData({ ...formData, showInFooter: e.target.checked })}
                  className="w-5 h-5 text-[#4caf50] rounded focus:ring-2 focus:ring-[#4caf50]"
                />
                <span>Footer'da Göster</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sıralama
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4caf50] focus:border-transparent"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Küçük sayılar önce gösterilir
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
            >
              {editingPage ? "Güncelle" : "Oluştur"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setEditingPage(null)
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleCreate}
        className="px-6 py-3 bg-[#4caf50] text-white rounded-lg hover:bg-[#45a049] transition-colors font-medium"
      >
        + Yeni Sayfa Oluştur
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Görünüm
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Sıra
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Henüz sayfa oluşturulmamış
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{page.title}</div>
                      <div className="text-sm text-gray-500">{page.views} görüntülenme</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        /{page.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          page.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {page.isPublished ? "Yayında" : "Taslak"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 text-xs">
                        {page.showInTopNavbar && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Üst Nav
                          </span>
                        )}
                        {page.showInNavbar && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Nav
                          </span>
                        )}
                        {page.showInFooter && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Footer
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium">{page.order}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(page)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {page.isPublished ? "Yayından Kaldır" : "Yayınla"}
                        </button>
                        <button
                          onClick={() => handleEdit(page)}
                          className="text-[#4caf50] hover:text-[#45a049] text-sm font-medium"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
