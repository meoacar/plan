"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"

interface Comment {
  id: string
  body: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  plan: {
    id: string
    title: string
    slug: string
  }
}

interface CommentListProps {
  initialComments: Comment[]
  total: number
  currentPage: number
  totalPages: number
}

export function CommentList({ 
  initialComments, 
  total, 
  currentPage, 
  totalPages 
}: CommentListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [comments, setComments] = useState(initialComments)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)
    params.set("page", "1")
    router.push(`/admin/comments?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/admin/comments?${params.toString()}`)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(comments.map(c => c.id))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== id))
        setSelectedIds(prev => prev.filter(i => i !== id))
      } else {
        alert("Yorum silinemedi")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`${selectedIds.length} yorumu silmek istediğinizden emin misiniz?`)) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/comments/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentIds: selectedIds }),
      })

      if (res.ok) {
        setComments(prev => prev.filter(c => !selectedIds.includes(c.id)))
        setSelectedIds([])
      } else {
        alert("Yorumlar silinemedi")
      }
    } catch (error) {
      console.error("Bulk delete error:", error)
      alert("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Arama ve Filtreleme */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Arama kutusu */}
            <div>
              <label className="block text-sm font-medium mb-2">
                🔍 Arama (yorum, yazar veya plan)
              </label>
              <Input
                type="text"
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Tarih aralığı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  📅 Başlangıç Tarihi
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  📅 Bitiş Tarihi
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Sıralama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  📊 Sıralama Kriteri
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="createdAt">Tarih</option>
                  <option value="user">Yazar</option>
                  <option value="plan">Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  🔄 Sıralama Yönü
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="desc">Azalan</option>
                  <option value="asc">Artan</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full font-bold">
              🔍 Filtrele
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toplu işlemler */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
          <span className="font-medium">
            {selectedIds.length} yorum seçildi
          </span>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={loading}
            className="font-bold"
          >
            {loading ? "⏳ Siliniyor..." : "🗑️ Toplu Sil"}
          </Button>
        </div>
      )}

      {/* Yorum listesi */}
      {comments.length === 0 ? (
        <Card className="bg-gray-50 border-2 border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-xl font-semibold text-gray-600">
              💬 Yorum bulunamadı.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.length === comments.length}
              onChange={toggleSelectAll}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Tümünü Seç</span>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="shadow-md hover:shadow-lg transition-shadow border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(comment.id)}
                      onChange={() => toggleSelect(comment.id)}
                      className="w-4 h-4 mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-base text-gray-800 mb-3">
                        {comment.body}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="font-medium">
                          👤 {comment.user.name || comment.user.email}
                        </span>
                        <Link
                          href={`/plan/${comment.plan.slug}`}
                          className="text-[#2d7a4a] hover:underline font-medium"
                          target="_blank"
                        >
                          📋 {comment.plan.title}
                        </Link>
                        <span>
                          📅 {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={loading}
                      className="font-bold flex-shrink-0"
                    >
                      🗑️ Sil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="text-sm text-gray-600 font-medium">
                Toplam <span className="font-bold text-gray-900">{total}</span> yorum
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="font-bold"
                >
                  ← Önceki
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="font-bold min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="font-bold"
                >
                  Sonraki →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
