"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"

// ActivityType enum (Prisma'dan)
type ActivityType =
  | "PLAN_APPROVED"
  | "PLAN_REJECTED"
  | "PLAN_DELETED"
  | "USER_ROLE_CHANGED"
  | "USER_DELETED"
  | "COMMENT_DELETED"
  | "SETTINGS_UPDATED"
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "CATEGORY_DELETED"
  | "TAG_CREATED"
  | "TAG_DELETED"
  | "EMAIL_SENT"
  | "BACKUP_CREATED"
  | "CACHE_CLEARED"

interface ActivityLog {
  id: string
  type: ActivityType
  description: string
  targetId: string | null
  targetType: string | null
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface ActivityLogViewerProps {
  initialLogs: ActivityLog[]
  total: number
  currentPage: number
  totalPages: number
}

// Aktivite tipi için Türkçe etiketler
const activityTypeLabels: Record<ActivityType, string> = {
  PLAN_APPROVED: "Plan Onaylandı",
  PLAN_REJECTED: "Plan Reddedildi",
  PLAN_DELETED: "Plan Silindi",
  USER_ROLE_CHANGED: "Kullanıcı Rolü Değişti",
  USER_DELETED: "Kullanıcı Silindi",
  COMMENT_DELETED: "Yorum Silindi",
  SETTINGS_UPDATED: "Ayarlar Güncellendi",
  CATEGORY_CREATED: "Kategori Oluşturuldu",
  CATEGORY_UPDATED: "Kategori Güncellendi",
  CATEGORY_DELETED: "Kategori Silindi",
  TAG_CREATED: "Etiket Oluşturuldu",
  TAG_DELETED: "Etiket Silindi",
  EMAIL_SENT: "Email Gönderildi",
  BACKUP_CREATED: "Yedek Oluşturuldu",
  CACHE_CLEARED: "Cache Temizlendi",
}

// Aktivite tipi için emoji
const activityTypeEmojis: Record<ActivityType, string> = {
  PLAN_APPROVED: "✅",
  PLAN_REJECTED: "❌",
  PLAN_DELETED: "🗑️",
  USER_ROLE_CHANGED: "👤",
  USER_DELETED: "🚫",
  COMMENT_DELETED: "💬",
  SETTINGS_UPDATED: "⚙️",
  CATEGORY_CREATED: "🏷️",
  CATEGORY_UPDATED: "✏️",
  CATEGORY_DELETED: "🗑️",
  TAG_CREATED: "🔖",
  TAG_DELETED: "🗑️",
  EMAIL_SENT: "📧",
  BACKUP_CREATED: "💾",
  CACHE_CLEARED: "🧹",
}

export function ActivityLogViewer({
  initialLogs,
  total,
  currentPage,
  totalPages,
}: ActivityLogViewerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [logs] = useState(initialLogs)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [type, setType] = useState(searchParams.get("type") || "")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (type) params.set("type", type)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    params.set("page", "1")
    router.push(`/admin/activity-log?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/admin/activity-log?${params.toString()}`)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (type) params.set("type", type)
      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)

      const res = await fetch(`/api/admin/activity-log/export?${params.toString()}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Export başarısız oldu")
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("Bir hata oluştu")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      {/* Filtreleme */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Arama kutusu */}
            <div>
              <label className="block text-sm font-medium mb-2">
                🔍 Kullanıcı Ara (ad veya email)
              </label>
              <Input
                type="text"
                placeholder="Kullanıcı ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>

            {/* İşlem tipi filtresi */}
            <div>
              <label className="block text-sm font-medium mb-2">
                📊 İşlem Tipi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Tümü</option>
                {Object.entries(activityTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {activityTypeEmojis[key as ActivityType]} {label}
                  </option>
                ))}
              </select>
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

            <div className="flex gap-2">
              <Button onClick={handleFilter} className="flex-1 font-bold">
                🔍 Filtrele
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting}
                variant="outline"
                className="font-bold"
              >
                {exporting ? "⏳ İndiriliyor..." : "📥 CSV Export"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktivite listesi */}
      {logs.length === 0 ? (
        <Card className="bg-gray-50 border-2 border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-xl font-semibold text-gray-600">
              📝 Aktivite kaydı bulunamadı.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <Card
                key={log.id}
                className="shadow-md hover:shadow-lg transition-shadow border-2 cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">
                      {activityTypeEmojis[log.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">
                          {activityTypeLabels[log.type]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {log.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="font-medium">
                          👤 {log.user.name || log.user.email}
                        </span>
                        {log.targetType && (
                          <span>
                            🎯 {log.targetType}
                          </span>
                        )}
                        {log.ipAddress && (
                          <span>
                            🌐 {log.ipAddress}
                          </span>
                        )}
                      </div>
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
                Toplam <span className="font-bold text-gray-900">{total}</span> aktivite
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
                  let page: number
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }

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

      {/* Metadata Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLog(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {activityTypeEmojis[selectedLog.type]} Aktivite Detayları
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                  className="font-bold"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">İşlem Tipi</label>
                  <p className="font-semibold">{activityTypeLabels[selectedLog.type]}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Açıklama</label>
                  <p>{selectedLog.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Kullanıcı</label>
                  <p>{selectedLog.user.name || selectedLog.user.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Tarih</label>
                  <p>
                    {new Date(selectedLog.createdAt).toLocaleString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>

                {selectedLog.targetId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hedef ID</label>
                    <p className="font-mono text-sm">{selectedLog.targetId}</p>
                  </div>
                )}

                {selectedLog.targetType && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hedef Tip</label>
                    <p>{selectedLog.targetType}</p>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP Adresi</label>
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">User Agent</label>
                    <p className="text-sm break-all">{selectedLog.userAgent}</p>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Metadata</label>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
