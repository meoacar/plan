"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link"

interface CommentStats {
  total: number
  approved: number
  pending: number
  rejected: number
  spam: number
  recent7Days: number
  recent30Days: number
  topPlans: Array<{
    id: string
    title: string
    slug: string
    commentCount: number
  }>
  topCommenters: Array<{
    id: string
    name: string
    email: string
    commentCount: number
  }>
  dailyTrend: Array<{
    date: string
    count: number
  }>
}

export function CommentStatsWidget() {
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/comments/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Stats fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-600">⏳ İstatistikler yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-red-600">❌ İstatistikler yüklenemedi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">📊 Son 7 Gün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{stats.recent7Days}</div>
            <p className="text-sm text-gray-600">yeni yorum</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">📊 Son 30 Gün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{stats.recent30Days}</div>
            <p className="text-sm text-gray-600">yeni yorum</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">📊 Günlük Ortalama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">
              {Math.round(stats.recent30Days / 30)}
            </div>
            <p className="text-sm text-gray-600">yorum/gün</p>
          </CardContent>
        </Card>
      </div>

      {/* En Çok Yorumlanan Planlar */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 En Çok Yorumlanan Planlar</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topPlans.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Henüz yorum yok</p>
          ) : (
            <div className="space-y-2">
              {stats.topPlans.map((plan, index) => (
                <Link
                  key={plan.id}
                  href={`/plan/${plan.slug}`}
                  target="_blank"
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-800">{plan.title}</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                    {plan.commentCount} yorum
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* En Aktif Yorumcular */}
      <Card>
        <CardHeader>
          <CardTitle>👥 En Aktif Yorumcular</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topCommenters.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Henüz yorum yok</p>
          ) : (
            <div className="space-y-2">
              {stats.topCommenters.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  target="_blank"
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{user.name || "Anonim"}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold text-sm">
                    {user.commentCount} yorum
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Günlük Trend */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Son 30 Gün Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dailyTrend.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Veri yok</p>
          ) : (
            <div className="space-y-1">
              {stats.dailyTrend.slice(0, 10).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">
                    {new Date(day.date).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short"
                    })}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.min((day.count / Math.max(...stats.dailyTrend.map(d => d.count))) * 100, 100)}%`
                      }}
                    >
                      <span className="text-xs font-bold text-white">{day.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
