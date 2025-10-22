"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

interface SystemInfo {
  dbSize: number
  totalRecords: {
    users: number
    plans: number
    comments: number
    likes: number
    categories: number
    tags: number
    total: number
  }
  lastBackup: Date | null
}

interface Backup {
  id: string
  filename: string
  size: number
  type: string
  createdAt: Date
  creator: {
    id: string
    name: string | null
    email: string
  } | null
}

interface MaintenancePanelProps {
  systemInfo: SystemInfo
  backups: Backup[]
}

/**
 * Bakım paneli component'i
 * Requirements: 11.2, 11.4, 11.6, 11.8, 11.10
 */
export function MaintenancePanel({
  systemInfo,
  backups: initialBackups,
}: MaintenancePanelProps) {
  const [backups, setBackups] = useState(initialBackups)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      const response = await fetch("/api/admin/maintenance/backup", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Yedek oluşturulamadı")
      }

      const data = await response.json()
      showMessage("success", "Yedek başarıyla oluşturuldu")

      // Backup listesini yenile
      const backupsResponse = await fetch("/api/admin/maintenance/backup")
      const backupsData = await backupsResponse.json()
      setBackups(backupsData.backups)
    } catch (error) {
      showMessage("error", "Yedek oluşturulurken hata oluştu")
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleClearCache = async () => {
    if (!confirm("Cache'i temizlemek istediğinizden emin misiniz?")) {
      return
    }

    setIsClearingCache(true)
    try {
      const response = await fetch("/api/admin/maintenance/cache", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Cache temizlenemedi")
      }

      showMessage("success", "Cache başarıyla temizlendi")
    } catch (error) {
      showMessage("error", "Cache temizlenirken hata oluştu")
    } finally {
      setIsClearingCache(false)
    }
  }

  const handleHealthCheck = async () => {
    setIsCheckingHealth(true)
    try {
      const response = await fetch("/api/admin/maintenance/health")

      if (!response.ok) {
        throw new Error("Sağlık kontrolü yapılamadı")
      }

      const data = await response.json()
      setHealthStatus(data)
      showMessage("success", "Sağlık kontrolü tamamlandı")
    } catch (error) {
      showMessage("error", "Sağlık kontrolü yapılırken hata oluştu")
    } finally {
      setIsCheckingHealth(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* System Info Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Veritabanı Boyutu
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatBytes(systemInfo.dbSize)}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Toplam Kayıt
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {systemInfo.totalRecords.total.toLocaleString("tr-TR")}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {systemInfo.totalRecords.users} kullanıcı, {systemInfo.totalRecords.plans} plan
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Son Yedekleme
          </h3>
          <p className="text-xl font-bold text-gray-900">
            {systemInfo.lastBackup
              ? formatDistanceToNow(new Date(systemInfo.lastBackup), {
                  addSuffix: true,
                  locale: tr,
                })
              : "Henüz yedek yok"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Bakım İşlemleri</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreatingBackup ? "Oluşturuluyor..." : "📦 Yedek Oluştur"}
          </button>

          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {isClearingCache ? "Temizleniyor..." : "🗑️ Cache Temizle"}
          </button>

          <button
            onClick={handleHealthCheck}
            disabled={isCheckingHealth}
            className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isCheckingHealth ? "Kontrol Ediliyor..." : "🏥 Sağlık Kontrolü"}
          </button>
        </div>
      </div>

      {/* Health Status */}
      {healthStatus && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Sistem Durumu</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Veritabanı:</span>
              <span
                className={`font-medium ${
                  healthStatus.database.status === "ok"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {healthStatus.database.status === "ok"
                  ? `✓ Bağlı (${healthStatus.database.latency})`
                  : "✗ Hata"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Bellek Kullanımı:</span>
              <span className="font-medium text-gray-900">
                {healthStatus.memory.heapUsed} / {healthStatus.memory.heapTotal}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Çalışma Süresi:</span>
              <span className="font-medium text-gray-900">
                {Math.floor(healthStatus.uptime / 3600)} saat
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Backup History */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Yedekleme Geçmişi</h2>
        {backups.length === 0 ? (
          <p className="text-gray-500">Henüz yedek oluşturulmamış</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Dosya Adı</th>
                  <th className="pb-3 font-medium">Boyut</th>
                  <th className="pb-3 font-medium">Tip</th>
                  <th className="pb-3 font-medium">Oluşturan</th>
                  <th className="pb-3 font-medium">Tarih</th>
                  <th className="pb-3 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b">
                    <td className="py-3 text-sm">{backup.filename}</td>
                    <td className="py-3 text-sm">{formatBytes(backup.size)}</td>
                    <td className="py-3 text-sm">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          backup.type === "manual"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {backup.type === "manual" ? "Manuel" : "Otomatik"}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {backup.creator?.name || "Sistem"}
                    </td>
                    <td className="py-3 text-sm">
                      {formatDistanceToNow(new Date(backup.createdAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </td>
                    <td className="py-3 text-sm">
                      <a
                        href={`/api/admin/maintenance/backup/download/${backup.filename}`}
                        className="text-blue-600 hover:underline"
                        download
                      >
                        İndir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Details */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Kayıt Detayları</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Kullanıcılar</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemInfo.totalRecords.users.toLocaleString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Planlar</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemInfo.totalRecords.plans.toLocaleString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Yorumlar</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemInfo.totalRecords.comments.toLocaleString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Beğeniler</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemInfo.totalRecords.likes.toLocaleString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kategoriler</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemInfo.totalRecords.categories.toLocaleString("tr-TR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Etiketler</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemInfo.totalRecords.tags.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
