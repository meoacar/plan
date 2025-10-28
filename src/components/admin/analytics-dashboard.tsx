"use client"

import { useState } from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import { UserGrowthChart } from "./charts/user-growth-chart"
import { PlanActivityChart } from "./charts/plan-activity-chart"
import { EngagementChart } from "./charts/engagement-chart"
import { TopUsersTable } from "./top-users-table"
import { TopPlansTable } from "./top-plans-table"

interface StatCardProps {
  title: string
  value: number
  change?: number
  icon: string
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value.toLocaleString("tr-TR")}</p>
          {change !== undefined && (
            <p className={`mt-2 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "↑" : "↓"} {Math.abs(change)}% önceki döneme göre
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

interface DateRangeSelectorProps {
  startDate: Date
  endDate: Date
  onDateChange: (start: Date, end: Date) => void
}

function DateRangeSelector({ startDate, endDate, onDateChange }: DateRangeSelectorProps) {
  const presets = [
    { label: "Bugün", days: 0 },
    { label: "Son 7 Gün", days: 7 },
    { label: "Son 30 Gün", days: 30 },
    { label: "Son 90 Gün", days: 90 },
  ]

  const handlePresetClick = (days: number) => {
    const end = endOfDay(new Date())
    const start = days === 0 ? startOfDay(new Date()) : startOfDay(subDays(end, days))
    onDateChange(start, end)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset.days)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={format(startDate, "yyyy-MM-dd")}
          onChange={(e) => onDateChange(new Date(e.target.value), endDate)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <span className="text-gray-500">-</span>
        <input
          type="date"
          value={format(endDate, "yyyy-MM-dd")}
          onChange={(e) => onDateChange(startDate, new Date(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  )
}

interface AnalyticsDashboardProps {
  initialData: {
    stats: {
      totalUsers: number
      totalPlans: number
      totalComments: number
      totalLikes: number
      totalConfessions: number
      totalConfessionComments: number
      totalGroups: number
      totalFollows: number
      totalNotifications: number
      newUsers: number
      newPlans: number
      newConfessions: number
      newGroups: number
      avgViews: number
      userChange: number
      planChange: number
      confessionChange: number
      pendingConfessions: number
      approvedConfessions: number
      rejectedConfessions: number
    }
    userGrowth: Array<{ date: string; count: number }>
    planActivity: Array<{ date: string; count: number }>
    engagement: Array<{ date: string; comments: number; likes: number }>
    topUsers: Array<{
      user: { id: string; name: string | null; email: string; image: string | null }
      activityScore: number
      planCount: number
      commentCount: number
      likeCount: number
    }>
    topPlans: Array<{
      plan: { id: string; title: string; slug: string; authorName: string | null }
      views: number
      likes: number
      comments: number
    }>
  }
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [startDate, setStartDate] = useState(startOfDay(subDays(new Date(), 30)))
  const [endDate, setEndDate] = useState(endOfDay(new Date()))

  const handleDateChange = async (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
    setLoading(true)

    try {
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })

      const response = await fetch(`/api/admin/analytics?${params}`)
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      const response = await fetch(`/api/admin/analytics/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export analytics:", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analitik ve Raporlar</h2>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {exporting ? "İndiriliyor..." : "📊 CSV İndir"}
        </button>
      </div>

      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Toplam Kullanıcı"
              value={data.stats.totalUsers}
              change={data.stats.userChange}
              icon="👥"
            />
            <StatCard
              title="Toplam Plan"
              value={data.stats.totalPlans}
              change={data.stats.planChange}
              icon="📋"
            />
            <StatCard
              title="Toplam Yorum"
              value={data.stats.totalComments}
              icon="💬"
            />
            <StatCard
              title="Toplam Beğeni"
              value={data.stats.totalLikes}
              icon="❤️"
            />
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">🆕 Yeni Özellikler</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Toplam İtiraf"
                value={data.stats.totalConfessions}
                change={data.stats.confessionChange}
                icon="🙏"
              />
              <StatCard
                title="İtiraf Yorumları"
                value={data.stats.totalConfessionComments}
                icon="💭"
              />
              <StatCard
                title="Sosyal Gruplar"
                value={data.stats.totalGroups}
                icon="👨‍👩‍👧‍👦"
              />
              <StatCard
                title="Takip İlişkileri"
                value={data.stats.totalFollows}
                icon="🤝"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">📊 İtiraf Moderasyon</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <StatCard
                title="Bekleyen İtiraflar"
                value={data.stats.pendingConfessions}
                icon="⏳"
              />
              <StatCard
                title="Onaylanan İtiraflar"
                value={data.stats.approvedConfessions}
                icon="✅"
              />
              <StatCard
                title="Reddedilen İtiraflar"
                value={data.stats.rejectedConfessions}
                icon="❌"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              title="Yeni Kullanıcılar"
              value={data.stats.newUsers}
              icon="✨"
            />
            <StatCard
              title="Yeni Planlar"
              value={data.stats.newPlans}
              icon="📝"
            />
            <StatCard
              title="Yeni İtiraflar"
              value={data.stats.newConfessions}
              icon="🆕"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <UserGrowthChart data={data.userGrowth} />
            <PlanActivityChart data={data.planActivity} />
          </div>

          <EngagementChart data={data.engagement} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TopUsersTable users={data.topUsers} />
            <TopPlansTable plans={data.topPlans} />
          </div>
        </>
      )}
    </div>
  )
}
