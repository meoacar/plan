"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PlanCard } from "./plan-card"
import { Pagination } from "./pagination"

interface Plan {
  id: string
  title: string
  slug: string
  startWeight: number
  goalWeight: number
  durationText: string
  imageUrl: string | null
  views: number
  user: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
    comments: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function PlanList() {
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<Plan[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"recent" | "popular">("recent")

  useEffect(() => {
    fetchPlans()
  }, [tab, searchParams])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("sort", tab)
      params.set("status", "APPROVED")
      
      const search = searchParams.get("search")
      const minWeight = searchParams.get("minWeight")
      const maxWeight = searchParams.get("maxWeight")
      const page = searchParams.get("page") || "1"
      
      if (search) params.set("search", search)
      if (minWeight) params.set("minWeight", minWeight)
      if (maxWeight) params.set("maxWeight", maxWeight)
      params.set("page", page)
      
      const res = await fetch(`/api/plans?${params.toString()}`)
      const data = await res.json()
      setPlans(data.plans || [])
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 })
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-4 mb-12 flex-wrap">
        <button
          onClick={() => setTab("recent")}
          className={`group relative px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 ${
            tab === "recent"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105"
              : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
          }`}
        >
          <span className="flex items-center gap-3">
            <span className="text-3xl">🆕</span>
            <span>Son Eklenenler</span>
          </span>
        </button>
        <button
          onClick={() => setTab("popular")}
          className={`group relative px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 ${
            tab === "popular"
              ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xl scale-105"
              : "bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
          }`}
        >
          <span className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <span>Popüler</span>
          </span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="relative">
              <div className="relative bg-white rounded-3xl p-6 border border-gray-200 shadow-md">
                <div className="h-56 bg-gray-100 rounded-2xl mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="relative">
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 shadow-lg">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-7xl">📭</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-3">Plan bulunamadı</p>
            <p className="text-gray-600 text-lg">Farklı filtreler deneyebilirsiniz</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="h-full">
                <PlanCard plan={plan} />
              </div>
            ))}
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
          />
        </>
      )}
    </div>
  )
}
