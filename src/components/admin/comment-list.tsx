"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { CommentDetailModal } from "@/components/admin/comment-detail-modal"
import { CommentStatsWidget } from "@/components/admin/comment-stats-widget"

interface Comment {
  id: string
  body: string
  status: string
  isSpam: boolean
  moderatedAt: Date | null
  moderationNote: string | null
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
  moderator: {
    name: string
  } | null
}

interface CommentListProps {
  initialComments: Comment[]
  total: number
  currentPage: number
  totalPages: number
  stats: {
    total: number
    approved: number
    pending: number
    rejected: number
    spam: number
  }
}

export function CommentList({ 
  initialComments, 
  total, 
  currentPage, 
  totalPages,
  stats 
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
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [spamFilter, setSpamFilter] = useState(searchParams.get("spam") === "true")
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [showStats, setShowStats] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (spamFilter) params.set("spam", "true")
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

  const handleModerate = async (id: string, action: "approve" | "reject" | "spam", note?: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/comments/${id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      })

      if (res.ok) {
        const { comment } = await res.json()
        setComments(prev => prev.map(c => c.id === id ? comment : c))
        setSelectedComment(null)
      } else {
        alert("Moderasyon işlemi başarısız")
      }
    } catch (error) {
      console.error("Moderation error:", error)
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

  const handleExport = () => {
    const params = new URLSearchParams()
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    window.open(`/api/admin/comments/export?${params.toString()}`, "_blank")
  }

  const getStatusBadge = (status: string, isSpam: boolean) => {
    if (isSpam) {
      return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">🚫 SPAM</span>
    }
    switch (status) {
      case "APPROVED":
        return <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">✅ Onaylı</span>
      case "PENDING":
        return <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded">⏳ Beklemede</span>
      case "REJECTED":
        return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">❌ Reddedildi</span>
      default:
        return null
    }
  }

  return (
    <div>
      {/* İstatistikler Widget */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setShowStats(!showStats)}
          className="mb-4 font-bold"
        >
          {showStats ? "📊 İstatistikleri Gizle" : "📊 İstatistikleri Göster"}
        </Button>
        
        {showStats && <CommentStatsWidget />}
      </div>

      {/* Hızlı İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Toplam</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Onaylı</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-2 border-yellow-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Beklemede</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-2 border-red-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Reddedildi</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.spam}</div>
            <div className="text-sm text-gray-600">Spam</div>
          </CardContent>
        </Card>
      </div>

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

            {/* Durum ve Spam Filtreleri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  📋 Durum Filtresi
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">Tümü</option>
                  <option value="APPROVED">Onaylı</option>
                  <option value="PENDING">Beklemede</option>
                  <option value="REJECTED">Reddedildi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  🚫 Spam Filtresi
                </label>
                <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spamFilter}
                    onChange={(e) => setSpamFilter(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Sadece spam yorumları göster</span>
                </label>
              </div>
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

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1 font-bold">
                🔍 Filtrele
              </Button>
              <Button onClick={handleExport} variant="outline" className="font-bold">
                📥 Dışa Aktar (CSV)
              </Button>
            </div>
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
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(comment.status, comment.isSpam)}
                      </div>
                      <p className="text-base text-gray-800 mb-3">
                        {comment.body}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <Link
                          href={`/profile/${comment.user.id}`}
                          className="text-blue-600 hover:underline font-medium"
                          target="_blank"
                        >
                          👤 {comment.user.name || comment.user.email}
                        </Link>
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
                        {comment.moderatedAt && (
                          <span className="text-purple-600">
                            ⚖️ Moderatör: {comment.moderator?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedComment(comment)}
                        className="font-bold"
                      >
                        👁️ Detay
                      </Button>
                      {comment.status !== "APPROVED" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleModerate(comment.id, "approve")}
                          disabled={loading}
                          className="font-bold bg-green-600 hover:bg-green-700"
                        >
                          ✅ Onayla
                        </Button>
                      )}
                      {comment.status !== "REJECTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerate(comment.id, "reject")}
                          disabled={loading}
                          className="font-bold text-orange-600 border-orange-600"
                        >
                          ❌ Reddet
                        </Button>
                      )}
                      {!comment.isSpam && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerate(comment.id, "spam")}
                          disabled={loading}
                          className="font-bold text-red-600 border-red-600"
                        >
                          🚫 Spam
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        disabled={loading}
                        className="font-bold"
                      >
                        🗑️ Sil
                      </Button>
                    </div>
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

      {/* Detay Modal */}
      {selectedComment && (
        <CommentDetailModal
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
          onModerate={handleModerate}
          onDelete={handleDelete}
          loading={loading}
        />
      )}
    </div>
  )
}
