"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"
import { useState, useRef, useEffect } from "react"
import { Menu, X, User, LogOut, Settings, ChevronDown, FolderOpen, Camera, Trophy, BarChart3, Users, BarChart2, Utensils, Store, Gamepad2, Target } from "lucide-react"
import { Logo } from "./logo"
import { NotificationBell } from "./notifications/notification-bell"
import CoinBalance from "./coins/CoinBalance"

interface NavbarPage {
  id: string
  title: string
  slug: string
  showInNavbar: boolean
  showInTopNavbar: boolean
}

interface NavbarClientProps {
  siteTitle: string
  logoUrl?: string | null
  navbarPages: NavbarPage[]
}

export function NavbarClient({ siteTitle, logoUrl, navbarPages }: NavbarClientProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false)
  const [coins, setCoins] = useState<number>(0)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const featuresMenuRef = useRef<HTMLDivElement>(null)

  // Coin bakiyesini getir
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/coins/balance')
        .then(res => res.json())
        .then(data => {
          if (data.coins !== undefined) {
            setCoins(data.coins)
          }
        })
        .catch(err => console.error('Coin bakiyesi alınamadı:', err))
    }
  }, [session?.user?.id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
      if (featuresMenuRef.current && !featuresMenuRef.current.contains(event.target as Node)) {
        setFeaturesMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 md:justify-between">
          {/* Mobile: Hamburger Left (Hidden) */}
          <div className="md:hidden w-10"></div>

          {/* Logo - Centered on Mobile, Left on Desktop */}
          <Link href="/" className="flex items-center gap-2 transition-all hover:scale-105 group flex-1 justify-center md:justify-start md:flex-initial">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteTitle}
                className="h-12 sm:h-12 w-auto object-contain transition-transform group-hover:scale-110"
              />
            ) : (
              <>
                <Logo size={48} className="md:hidden transition-transform group-hover:rotate-12" />
                <Logo size={40} className="hidden md:block transition-transform group-hover:rotate-12" />
                <span className="text-xl sm:text-xl font-bold text-[#2d7a4a] truncate max-w-[180px] sm:max-w-none">
                  {siteTitle}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className={`text-base font-medium transition-colors ${pathname === "/"
                ? "text-[#2d7a4a] font-semibold"
                : "text-gray-700 hover:text-[#2d7a4a]"
                }`}
            >
              Ana Sayfa
            </Link>

            <Link
              href="/submit"
              className={`text-base font-medium transition-colors ${pathname === "/submit"
                ? "text-[#2d7a4a] font-semibold"
                : "text-gray-700 hover:text-[#2d7a4a]"
                }`}
            >
              Plan Ekle
            </Link>

            {/* Dynamic Top Navbar Pages */}
            {navbarPages.filter(p => p.showInTopNavbar).map((page) => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                className={`text-base font-medium transition-colors ${pathname === `/pages/${page.slug}`
                  ? "text-[#2d7a4a] font-semibold"
                  : "text-gray-700 hover:text-[#2d7a4a]"
                  }`}
              >
                {page.title}
              </Link>
            ))}

            <div className="relative" ref={featuresMenuRef}>
              <button
                onClick={() => setFeaturesMenuOpen(!featuresMenuOpen)}
                className="flex items-center gap-1 text-base font-medium text-gray-700 hover:text-[#2d7a4a] transition-colors"
              >
                Özellikler
                <ChevronDown className={`w-4 h-4 transition-transform ${featuresMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {featuresMenuOpen && (
                <div className="absolute top-full mt-2 right-0 min-w-[400px] bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-[9999] max-h-[80vh] overflow-y-auto">
                  {/* Dynamic Navbar Pages */}
                  {navbarPages.filter(p => p.showInNavbar).length > 0 && (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sayfalar</p>
                      </div>
                      {navbarPages.filter(p => p.showInNavbar).map((page) => (
                        <Link
                          key={page.id}
                          href={`/pages/${page.slug}`}
                          onClick={() => setFeaturesMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">📄</span>
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium">{page.title}</span>
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 my-2"></div>
                    </>
                  )}

                  {/* Genel Özellikler */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Genel</p>
                  </div>
                  <Link
                    href="/kesfet"
                    onClick={() => setFeaturesMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">✨</span>
                    <div className="flex-1">
                      <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Keşfet</span>
                      <span className="text-xs text-gray-500">Neler yapabilirsin?</span>
                    </div>
                  </Link>
                  <Link
                    href="/polls"
                    onClick={() => setFeaturesMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                  >
                    <BarChart2 className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Anketler</span>
                      <span className="text-xs text-gray-500">Topluluk anketleri</span>
                    </div>
                  </Link>
                  <Link
                    href="/recipes"
                    onClick={() => setFeaturesMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                  >
                    <Utensils className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Sağlıklı Tarifler</span>
                      <span className="text-xs text-gray-500">Lezzetli ve sağlıklı</span>
                    </div>
                  </Link>
                  <Link
                    href="/blog"
                    onClick={() => setFeaturesMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">✍️</span>
                    <div className="flex-1">
                      <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Blog</span>
                      <span className="text-xs text-gray-500">İpuçları ve tavsiyeler</span>
                    </div>
                  </Link>

                  {session && (
                    <>
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kişisel</p>
                      </div>
                      <Link
                        href="/recipes/my-recipes"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">📖</span>
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Tariflerim</span>
                          <span className="text-xs text-gray-500">Kendi tarifleriniz</span>
                        </div>
                      </Link>
                      <Link
                        href="/collections"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <FolderOpen className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Koleksiyonlar</span>
                          <span className="text-xs text-gray-500">Favori planlarınız</span>
                        </div>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Takip & Analiz</p>
                      </div>
                      <Link
                        href="/progress"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <Camera className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Fotoğraf Galerisi</span>
                          <span className="text-xs text-gray-500">İlerleme fotoğrafları</span>
                        </div>
                      </Link>
                      <Link
                        href="/analytics"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <BarChart3 className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">İlerleme Takibi</span>
                          <span className="text-xs text-gray-500">Detaylı analizler</span>
                        </div>
                      </Link>
                      <Link
                        href="/calories"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <Utensils className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Kalori Takibi</span>
                          <span className="text-xs text-gray-500">Günlük kalori hesabı</span>
                        </div>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Motivasyon</p>
                      </div>
                      <Link
                        href="/gamification"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <Trophy className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Rozetler & Liderlik</span>
                          <span className="text-xs text-gray-500">Başarılarınız</span>
                        </div>
                      </Link>
                      <Link
                        href="/shop"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <Store className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Mağaza</span>
                          <span className="text-xs text-gray-500">Ödüller & Coinler</span>
                        </div>
                      </Link>
                      <Link
                        href="/games"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <Gamepad2 className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Mini Oyunlar</span>
                          <span className="text-xs text-gray-500">Oyna & Coin Kazan</span>
                        </div>
                      </Link>
                      <Link
                        href="/partnerships"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <Users className="w-5 h-5 text-[#2d7a4a] group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Partnerler</span>
                          <span className="text-xs text-gray-500">Birlikte zayıflayın</span>
                        </div>
                      </Link>
                      <Link
                        href="/gunah-sayaci"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">😈</span>
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Günah Sayacı</span>
                          <span className="text-xs text-gray-500">Kaçamak takibi</span>
                        </div>
                      </Link>
                      <Link
                        href="/gunah-itiraf"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">🍰</span>
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">İtiraf Duvarı</span>
                          <span className="text-xs text-gray-500">Mizah & empati</span>
                        </div>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sosyal</p>
                      </div>
                      <Link
                        href="/groups"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Gruplar</span>
                          <span className="text-xs text-gray-500">Topluluk grupları</span>
                        </div>
                      </Link>
                      <Link
                        href="/challenges"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">🏆</span>
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Challenge'lar</span>
                          <span className="text-xs text-gray-500">Yarışmalar</span>
                        </div>
                      </Link>
                      <Link
                        href="/friend-suggestions"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-[#2d7a4a]/5 hover:to-[#4caf50]/5 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">🦋</span>
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-[#2d7a4a] font-medium block">Arkadaş Önerileri</span>
                          <span className="text-xs text-gray-500">Yeni arkadaşlar</span>
                        </div>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>
                      <Link
                        href="/crisis-stats"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">🆘</span>
                        <div className="flex-1">
                          <span className="text-gray-700 group-hover:text-red-600 font-medium block">Kriz İstatistikleri</span>
                          <span className="text-xs text-gray-500">Destek ve yardım</span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {status === "loading" ? (
              <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : session ? (
              <>
                {/* Görevler Linki */}
                <Link
                  href="/gamification?tab=quests"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 group"
                  title="Görevler"
                >
                  <Target className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Görevler</span>
                </Link>

                {/* Coin Bakiyesi */}
                <Link href="/shop" title="Mağaza">
                  <CoinBalance coins={coins} size="sm" />
                </Link>

                {/* Bildirim İkonu */}
                <NotificationBell />

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#2d7a4a] to-[#4caf50] flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "Profil"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-base">{session.user?.name?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full mt-2 right-0 w-[95vw] sm:w-auto sm:min-w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100] max-h-[85vh] overflow-y-auto">

                      {/* Header - Kullanıcı Bilgileri */}
                      <div className="sticky top-0 bg-gradient-to-br from-[#2d7a4a] to-[#4caf50] px-8 py-6 text-white">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-white/30">
                            {session.user?.image ? (
                              <img
                                src={session.user.image}
                                alt={session.user.name || "Profil"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{session.user?.name?.[0]?.toUpperCase() || "?"}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold truncate">
                              {session.user?.name || "Kullanıcı"}
                            </h3>
                            <p className="text-base text-white/80 truncate mt-1">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ana Profil Linki */}
                      <div className="p-4 border-b border-gray-100">
                        <Link
                          href={`/profile/${session.user?.username || session.user?.id}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-5 px-5 py-4 rounded-xl hover:bg-gradient-to-r hover:from-[#2d7a4a]/10 hover:to-[#4caf50]/10 transition-all duration-200 group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2d7a4a] to-[#4caf50] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                            <User className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-gray-900 group-hover:text-[#2d7a4a] transition-colors">Profilimi Görüntüle</div>
                            <div className="text-sm text-gray-500">Profil sayfana git</div>
                          </div>
                          <ChevronDown className="w-6 h-6 text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      {/* Sosyal Bölüm */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="px-5 py-2 mb-2">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Sosyal</h4>
                        </div>

                        <Link
                          href="/bildirimler"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-5 px-5 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <span className="text-3xl">🔔</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Bildirimler</div>
                            <div className="text-sm text-gray-500">Yeni bildirimlerini gör</div>
                          </div>
                        </Link>

                        <Link
                          href={`/profile/${session.user?.username || session.user?.id}/following`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-5 px-5 py-4 rounded-xl hover:bg-purple-50 transition-all duration-200 group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Users className="w-7 h-7 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">Takip Edilenler</div>
                            <div className="text-sm text-gray-500">Takip ettiğin kişiler</div>
                          </div>
                        </Link>

                        <Link
                          href="/takip-istekleri"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-5 px-5 py-4 rounded-xl hover:bg-orange-50 transition-all duration-200 group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <User className="w-7 h-7 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Takip İstekleri</div>
                            <div className="text-sm text-gray-500">Bekleyen istekler</div>
                          </div>
                        </Link>
                      </div>

                      {/* Ayarlar Bölümü */}
                      <div className="p-4 border-b border-gray-100">
                        <Link
                          href="/ayarlar"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-5 px-5 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Settings className="w-7 h-7 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">Ayarlar</div>
                            <div className="text-sm text-gray-500">Hesap ayarlarını düzenle</div>
                          </div>
                        </Link>
                      </div>

                      {/* Admin Panel */}
                      {session.user?.role === "ADMIN" && (
                        <div className="p-4 border-b border-gray-100">
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-5 px-5 py-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                          >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                              <Settings className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">Admin Panel</div>
                              <div className="text-sm text-indigo-500">Yönetim paneline git</div>
                            </div>
                          </Link>
                        </div>
                      )}

                      {/* Çıkış Yap */}
                      <div className="p-4">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            signOut({ callbackUrl: "/" })
                          }}
                          className="flex items-center gap-5 px-5 py-4 rounded-xl hover:bg-red-50 transition-all duration-200 w-full group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-200 transition-all duration-200">
                            <LogOut className="w-7 h-7 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-base font-bold text-red-600 group-hover:text-red-700 transition-colors">Çıkış Yap</div>
                            <div className="text-sm text-red-500">Hesabından çıkış yap</div>
                          </div>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col gap-2">
              {/* Giriş Yap Butonu - En Üstte */}
              {status === "loading" ? (
                <div className="px-4 py-2">
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : !session ? (
                <div className="px-4 pb-3 mb-2 border-b border-gray-200">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full h-12 flex items-center justify-center gap-2 text-base font-bold">
                      <User className="w-5 h-5" />
                      Giriş Yap
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="px-4 pb-3 mb-2 border-b border-gray-200">
                  <Link
                    href={`/profile/${session.user?.username || session.user?.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#2d7a4a]/10 to-[#4caf50]/10 hover:from-[#2d7a4a]/20 hover:to-[#4caf50]/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#2d7a4a] to-[#4caf50] flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "Profil"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">{session.user?.name?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {session.user?.name || "Kullanıcı"}
                      </p>
                      <p className="text-xs text-gray-600">Profili Görüntüle →</p>
                    </div>
                  </Link>

                  {/* Coin Bakiyesi - Mobil */}
                  <div className="mt-3 flex items-center justify-center">
                    <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <CoinBalance coins={coins} size="md" className="w-full justify-center" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Ana Menü Öğeleri */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                🏠 Ana Sayfa
              </Link>
              <Link
                href="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/submit"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                ➕ Plan Ekle
              </Link>

              {/* Dynamic Top Navbar Pages - Mobile */}
              {navbarPages.filter(p => p.showInTopNavbar).length > 0 && (
                <>
                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sayfalar</p>
                  </div>
                  {navbarPages.filter(p => p.showInTopNavbar).map((page) => (
                    <Link
                      key={page.id}
                      href={`/pages/${page.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === `/pages/${page.slug}`
                        ? "bg-[#2d7a4a] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      📄 {page.title}
                    </Link>
                  ))}
                </>
              )}

              {/* Genel Özellikler */}
              <div className="px-4 py-2 mt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Genel</p>
              </div>
              <Link
                href="/polls"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/polls"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                📊 Anketler
              </Link>
              <Link
                href="/recipes"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/recipes"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                🍽️ Sağlıklı Tarifler
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/blog"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                ✍️ Blog
              </Link>

              {/* Sadece Giriş Yapanlar İçin */}
              {session && (
                <>
                  {/* Dynamic Navbar Pages - Mobile */}
                  {navbarPages.filter(p => p.showInNavbar && !p.showInTopNavbar).length > 0 && (
                    <>
                      <div className="px-4 py-2 mt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diğer Sayfalar</p>
                      </div>
                      {navbarPages.filter(p => p.showInNavbar && !p.showInTopNavbar).map((page) => (
                        <Link
                          key={page.id}
                          href={`/pages/${page.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === `/pages/${page.slug}`
                            ? "bg-[#2d7a4a] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          📄 {page.title}
                        </Link>
                      ))}
                    </>
                  )}

                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kişisel</p>
                  </div>
                  <Link
                    href="/bildirimler"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/bildirimler"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🔔 Bildirimler
                  </Link>
                  <Link
                    href="/ayarlar"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/ayarlar"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    ⚙️ Ayarlar
                  </Link>
                  <Link
                    href="/recipes/my-recipes"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/recipes/my-recipes"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📖 Tariflerim
                  </Link>
                  <Link
                    href="/collections"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/collections"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📁 Koleksiyonlar
                  </Link>

                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Takip & Analiz</p>
                  </div>
                  <Link
                    href="/progress"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/progress"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📸 Fotoğraf Galerisi
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/analytics"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📊 İlerleme Takibi
                  </Link>
                  <Link
                    href="/calories"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/calories"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🍽️ Kalori Takibi
                  </Link>

                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Motivasyon</p>
                  </div>
                  
                  {/* Görevler - Özel Vurgu */}
                  <Link
                    href="/gamification?tab=quests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mx-4 mb-2 p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6" />
                      <div className="flex-1">
                        <div className="font-bold">Görevler</div>
                        <div className="text-xs opacity-90">Günlük görevlerini tamamla</div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/gamification"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/gamification"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🏆 Rozetler & Liderlik
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/shop"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🛍️ Mağaza
                  </Link>
                  <Link
                    href="/games"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/games"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🎮 Mini Oyunlar
                  </Link>
                  <Link
                    href="/partnerships"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/partnerships"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    👥 Partnerler
                  </Link>
                  <Link
                    href="/gunah-sayaci"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/gunah-sayaci"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    😈 Günah Sayacı
                  </Link>

                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sosyal</p>
                  </div>
                  <Link
                    href="/groups"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/groups"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    👥 Gruplar
                  </Link>
                  <Link
                    href="/challenges"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/challenges"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🏆 Challenge'lar
                  </Link>
                  <Link
                    href="/friend-suggestions"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/friend-suggestions"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🦋 Arkadaş Önerileri
                  </Link>

                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/crisis-stats"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/crisis-stats"
                      ? "bg-red-600 text-white"
                      : "text-red-600 hover:bg-red-50"
                      }`}
                  >
                    🆘 Kriz İstatistikleri
                  </Link>

                  {/* Admin */}
                  {session.user?.role === "ADMIN" && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/admin")
                          ? "bg-[#2d7a4a] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </>
                  )}

                  {/* Çıkış */}
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
