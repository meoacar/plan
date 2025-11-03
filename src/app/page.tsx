import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanList } from "@/components/plan-list"
import { SearchFilter } from "@/components/search-filter"
import { HomeCTASection } from "@/components/home-cta-section"
import {
  Sparkles, Users, Zap,
  Heart, Star, Trophy, Flame, ArrowRight,
  CheckCircle2, Target, Dumbbell,
  Apple, Calendar, TrendingUp, Shield, Clock
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Hero Section - Ultra Modern */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.08),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.08),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 px-4 py-20 md:py-32 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-purple-900">Türkiye&apos;nin #1 Dönüşüm Platformu</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="block text-gray-900">Dönüşümün</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
                  Başlangıcı
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Binlerce kişinin gerçek başarı hikayelerinden ilham al. 
                <span className="font-semibold text-purple-600"> Kendi yolculuğunu başlat</span> ve 
                topluluğumuzun bir parçası ol.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">1000+</div>
                    <div className="text-sm text-gray-600">Aktif Üye</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Başarı Hikayesi</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                    <div className="text-sm text-gray-600">Memnuniyet</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/submit">
                  <Button className="group h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Zap className="w-5 h-5 mr-2" />
                    Hikayeni Paylaş
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/kesfet">
                  <Button variant="outline" className="h-14 px-8 border-2 border-purple-300 hover:border-purple-600 hover:bg-purple-50 rounded-xl font-semibold text-lg text-purple-700 transition-all duration-300">
                    <Heart className="w-5 h-5 mr-2" />
                    Hikayeleri Keşfet
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Kişisel Planlar</h3>
                  <p className="text-sm text-gray-600">Sana özel egzersiz ve beslenme programları</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-pink-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Topluluk Desteği</h3>
                  <p className="text-sm text-gray-600">Binlerce kişiyle motivasyon paylaş</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-orange-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">İlerleme Takibi</h3>
                  <p className="text-sm text-gray-600">Gelişimini detaylı şekilde izle</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Beslenme Rehberi</h3>
                  <p className="text-sm text-gray-600">Sağlıklı yemek tarifleri ve ipuçları</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Özellikler</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Neden <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Bizi Seçmelisin?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sadece bir platform değil, tam bir yaşam tarzı değişimi ekosistemi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-2xl opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Gerçek Sonuçlar</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sahte değil, gerçek insanların gerçek dönüşüm hikayeleri. Her hikaye bir ilham kaynağı.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-transparent rounded-2xl opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Kişisel Hedefler</h3>
                <p className="text-gray-600 leading-relaxed">
                  Herkesin yolculuğu farklı. Kendi hedeflerini belirle ve adım adım ilerle.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-2xl opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Destekleyici Topluluk</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yalnız değilsin! Binlerce kişi seninle aynı yolda. Birlikte daha güçlüyüz.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-2xl opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Düzenli Takip</h3>
                <p className="text-gray-600 leading-relaxed">
                  Günlük, haftalık ve aylık ilerleme raporlarıyla hedeflerine ulaş.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-2xl opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Güvenli Platform</h3>
                <p className="text-gray-600 leading-relaxed">
                  Verileriniz güvende. Gizlilik ve güvenlik önceliğimiz.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-transparent rounded-2xl opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">7/24 Erişim</h3>
                <p className="text-gray-600 leading-relaxed">
                  İstediğin zaman, istediğin yerden platformumuza erişebilirsin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Topluluğumuz Büyüyor! 🚀
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Her gün yüzlerce kişi hedeflerine ulaşıyor
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black mb-2">1000+</div>
              <div className="text-purple-100">Aktif Üye</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-2">500+</div>
              <div className="text-purple-100">Başarı Hikayesi</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-2">10K+</div>
              <div className="text-purple-100">Kilo Kaybı (kg)</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-2">4.9</div>
              <div className="text-purple-100">Ortalama Puan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">İlham Veren Hikayeler</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Başarı Hikayeleri</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seni motive edecek, ilham verecek gerçek dönüşüm hikayelerini keşfet
            </p>
          </div>
          <SearchFilter />
          <PlanList />
        </div>
      </section>

      {/* CTA Section */}
      <HomeCTASection />
    </div>
  )
}
