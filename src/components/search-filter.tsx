"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

type Category = {
  id: string
  name: string
  slug: string
  color: string
}

export function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [minWeight, setMinWeight] = useState(searchParams.get("minWeight") || "")
  const [maxWeight, setMaxWeight] = useState(searchParams.get("maxWeight") || "")
  const [duration, setDuration] = useState(searchParams.get("duration") || "")
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "")
  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Kategoriler yüklenemedi:", error)
      }
    }

    fetchCategories()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (minWeight) params.set("minWeight", minWeight)
    if (maxWeight) params.set("maxWeight", maxWeight)
    if (duration) params.set("duration", duration)
    if (categoryId) params.set("categoryId", categoryId)

    router.push(`/?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch("")
    setMinWeight("")
    setMaxWeight("")
    setDuration("")
    setCategoryId("")
    router.push("/")
  }

  const handleCategoryClick = (id: string) => {
    setCategoryId(id === categoryId ? "" : id)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (minWeight) params.set("minWeight", minWeight)
    if (maxWeight) params.set("maxWeight", maxWeight)
    if (duration) params.set("duration", duration)
    if (id !== categoryId) params.set("categoryId", id)

    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="relative group mb-12">
      <Card className="relative bg-white/90 backdrop-blur-xl border border-purple-100 shadow-xl rounded-3xl">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-6">
            {/* Kategori Filtreleri */}
            {categories.length > 0 && (
              <div>
                <label className="flex items-center gap-3 text-xl font-black mb-6 text-gray-900">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">🏷️</span>
                  </div>
                  Kategoriler
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleCategoryClick("")}
                    className={`rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 ${!categoryId
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                  >
                    ✨ Tümü
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 ${categoryId === category.id
                          ? "text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                        }`}
                      style={{
                        backgroundColor: categoryId === category.id ? category.color : undefined,
                        borderColor: categoryId === category.id ? `${category.color}80` : undefined,
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[250px] relative group/search">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
                  🔍
                </div>
                <Input
                  placeholder="Plan veya kullanıcı ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-16 bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 text-lg pl-14 pr-4 transition-all font-medium"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-16 px-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                🔍 Ara
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-16 px-8 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-purple-300 hover:bg-purple-50 transition-all"
              >
                {showFilters ? "🔼" : "🔽"} Filtreler
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-gray-100">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900">
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-sm">⚖️</span>
                    </div>
                    Min. Hedef Kilo (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="Örn: 60"
                    value={minWeight}
                    onChange={(e) => setMinWeight(e.target.value)}
                    min={20}
                    max={400}
                    className="h-14 bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 font-medium"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900">
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-sm">⚖️</span>
                    </div>
                    Max. Hedef Kilo (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="Örn: 80"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(e.target.value)}
                    min={20}
                    max={400}
                    className="h-14 bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 font-medium"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-sm">⏳</span>
                    </div>
                    Plan Süresi
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button
                      onClick={() => setDuration("")}
                      className={`h-14 rounded-xl px-4 text-sm font-bold transition-all duration-300 ${!duration
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                      Tümü
                    </button>
                    <button
                      onClick={() => setDuration("30")}
                      className={`h-14 rounded-xl px-4 text-sm font-bold transition-all duration-300 ${duration === "30"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                      1 Ay
                    </button>
                    <button
                      onClick={() => setDuration("90")}
                      className={`h-14 rounded-xl px-4 text-sm font-bold transition-all duration-300 ${duration === "90"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                      3 Ay
                    </button>
                    <button
                      onClick={() => setDuration("180")}
                      className={`h-14 rounded-xl px-4 text-sm font-bold transition-all duration-300 ${duration === "180"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                      6 Ay
                    </button>
                    <button
                      onClick={() => setDuration("365")}
                      className={`h-14 rounded-xl px-4 text-sm font-bold transition-all duration-300 ${duration === "365"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                      1 Yıl+
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-4 flex-wrap">
                  <Button
                    onClick={handleSearch}
                    className="flex-1 min-w-[200px] h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                  >
                    🔍 Filtrele
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="h-14 px-10 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-rose-400 hover:bg-rose-50 transition-all"
                  >
                    🔄 Temizle
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
