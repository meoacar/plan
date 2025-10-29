import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanList } from "@/components/plan-list"
import { SearchFilter } from "@/components/search-filter"
import {
  Sparkles, TrendingDown, Users, Award, Zap,
  Heart, Star, Trophy, Flame, ArrowRight,
  CheckCircle2, Target, MessageCircle
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-x-hidden">

      {/* Hero Section - Yeni Modern Tasarım */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-fuchsia-500/5 to-orange-500/5"></div>

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-200/10 to-fuchsia-200/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-7xl mx-auto">

            {/* Animated Badge */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <Flame className="w-5 h-5 relative z-10 animate-bounce" />
                <span className="font-bold relative z-10">🔥 Türkiye'nin En Büyük Motivasyon Topluluğu</span>
              </div>
            </div>

            {/* Main Heading - Yeni Stil */}
            <div className="text-center mb-8 space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-tight">
                <span className="block text-gray-900 mb-2">Hayalindeki</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 animate-gradient">
                  Vücuda Ulaş
                </span>
              </h1>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">4.9/5</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                  <Users className="w-5 h-5 text-violet-600" />
                  <span className="font-bold text-gray-900">1000+ Üye</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-900">500+ Başarı</span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 text-center max-w-3xl mx-auto mb-12 px-4 leading-relaxed">
              Gerçek insanların <span className="font-bold text-violet-600">gerçek dönüşüm hikayeleri</span> ile tanış.
              Sen de bu topluluğun bir parçası ol! 💪
            </p>

            {/* CTA Buttons - Yeni Tasarım */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4">
              <Link href="/submit" className="w-full sm:w-auto">
                <Button className="group relative w-full sm:w-auto h-16 px-10 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Zap className="w-6 h-6 mr-2 relative z-10" />
                  <span className="relative z-10">Hikayeni Paylaş</span>
                  <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#plans" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-16 px-10 border-2 border-violet-300 hover:border-violet-600 hover:bg-violet-50 rounded-2xl font-bold text-lg text-violet-700 hover:text-violet-900 transition-all duration-300 hover:scale-105 shadow-lg">
                  <Heart className="w-6 h-6 mr-2" />
                  Hikayeleri Keşfet
                </Button>
              </Link>
            </div>

            {/* Feature Cards - Yeni Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
              <div className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-violet-100">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">1000+</h3>
                  <p className="text-gray-600 font-medium">Aktif Topluluk Üyesi</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-emerald-100">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">500+</h3>
                  <p className="text-gray-600 font-medium">İlham Veren Hikaye</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-amber-100">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">10K+</h3>
                  <p className="text-gray-600 font-medium">Toplam Kilo Kaybı (kg)</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-pink-100">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">24/7</h3>
                  <p className="text-gray-600 font-medium">Destek & Motivasyon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
              Neden <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Biz?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sadece bir platform değil, bir yaşam tarzı değişimi topluluğu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-violet-50 to-white border border-violet-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Gerçek Sonuçlar</h3>
              <p className="text-gray-600 leading-relaxed">
                Sahte değil, gerçek insanların gerçek dönüşüm hikayeleri. Her hikaye bir ilham kaynağı.
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-fuchsia-50 to-white border border-fuchsia-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Kişisel Hedefler</h3>
              <p className="text-gray-600 leading-relaxed">
                Herkesin yolculuğu farklı. Kendi hedeflerini belirle ve adım adım ilerle.
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Destekleyici Topluluk</h3>
              <p className="text-gray-600 leading-relaxed">
                Yalnız değilsin! Binlerce kişi seninle aynı yolda. Birlikte daha güçlüyüz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="relative bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Başarı Hikayeleri</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seni motive edecek, ilham verecek gerçek dönüşüm hikayelerini keşfet
            </p>
          </div>
          <SearchFilter />
          <PlanList />
        </div>
      </section>
    </div>
  )
}
