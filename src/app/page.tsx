import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanList } from "@/components/plan-list"
import { SearchFilter } from "@/components/search-filter"
import { Sparkles, TrendingDown, Users, Award, Target, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      
      {/* Hero Section - Mobile Optimized */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239333ea' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="container mx-auto px-4 py-12 md:py-28 relative">
          <div className="max-w-6xl mx-auto">
            
            {/* Top Badge */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg text-sm md:text-base">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-bold">Türkiye'nin #1 Platformu</span>
              </div>
            </div>

            {/* Main Heading - Mobile First */}
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-center mb-4 md:mb-6 leading-tight px-2">
              <span className="text-gray-900">Gerçek İnsanlar,</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
                Gerçek Sonuçlar
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-xl text-gray-600 text-center max-w-3xl mx-auto mb-8 md:mb-12 px-4">
              Binlerce kişinin başarı hikayesini keşfet, ilham al ve kendi yolculuğunu başlat
            </p>

            {/* CTA Buttons - Mobile Stack */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 md:gap-4 mb-10 md:mb-16 px-4">
              <Link href="/submit" className="w-full sm:w-auto">
                <Button className="w-full h-12 md:h-14 px-6 md:px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Hikayeni Paylaş
                </Button>
              </Link>
              <Link href="#plans" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full h-12 md:h-14 px-6 md:px-8 border-2 border-gray-300 hover:border-purple-400 rounded-xl font-bold text-base md:text-lg">
                  Hikayeleri Keşfet
                </Button>
              </Link>
            </div>

            {/* Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border-2 border-purple-100 hover:border-purple-300 transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl md:text-3xl font-black text-gray-900">1000+</p>
                    <p className="text-xs md:text-sm text-gray-600 font-medium truncate">Aktif Kullanıcı</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border-2 border-emerald-100 hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl md:text-3xl font-black text-gray-900">500+</p>
                    <p className="text-xs md:text-sm text-gray-600 font-medium truncate">Başarı Hikayesi</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border-2 border-amber-100 hover:border-amber-300 transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl md:text-3xl font-black text-gray-900">10K+</p>
                    <p className="text-xs md:text-sm text-gray-600 font-medium truncate">Toplam Kilo Kaybı</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      {/* Plans Section */}
      <section id="plans" className="relative bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <SearchFilter />
          <PlanList />
        </div>
      </section>
    </div>
  )
}
