"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"
import { useState, useRef, useEffect } from "react"
import { Menu, X, User, LogOut, Settings, ChevronDown, FolderOpen, Camera, Trophy, BarChart3, Users, BarChart2, Utensils } from "lucide-react"
import { Logo } from "./logo"

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
  const userMenuRef = useRef<HTMLDivElement>(null)
  const featuresMenuRef = useRef<HTMLDivElement>(null)

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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-xl md:text-2xl font-bold text-[#2d7a4a] hover:text-[#236038] transition-all hover:scale-105 group">
            <Logo size={40} className="transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] bg-clip-text text-transparent">
              {siteTitle}
            </span>
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
                <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Dynamic Navbar Pages */}
                  {navbarPages.filter(p => p.showInNavbar).map((page) => (
                    <Link
                      key={page.id}
                      href={`/pages/${page.slug}`}
                      onClick={() => setFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">📄</span>
                      <span>{page.title}</span>
                    </Link>
                  ))}
                  {navbarPages.filter(p => p.showInNavbar).length > 0 && (
                    <div className="border-t border-gray-100 my-2"></div>
                  )}
                  <Link
                    href="/polls"
                    onClick={() => setFeaturesMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 text-[#2d7a4a]" />
                    <span>Anketler</span>
                  </Link>
                  <Link
                    href="/recipes"
                    onClick={() => setFeaturesMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">🍽️</span>
                    <span>Sağlıklı Tarifler</span>
                  </Link>
                  {session && (
                    <Link
                      href="/recipes/my-recipes"
                      onClick={() => setFeaturesMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">📖</span>
                      <span>Tariflerim</span>
                    </Link>
                  )}
                  {session && (
                    <>
                      <Link
                        href="/collections"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FolderOpen className="w-4 h-4 text-[#2d7a4a]" />
                        <span>Koleksiyonlar</span>
                      </Link>
                      <Link
                        href="/progress"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-[#2d7a4a]" />
                        <span>Fotoğraf Galerisi</span>
                      </Link>
                      <Link
                        href="/analytics"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-[#2d7a4a]" />
                        <span>İlerleme Takibi</span>
                      </Link>
                      <Link
                        href="/calories"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Utensils className="w-4 h-4 text-[#2d7a4a]" />
                        <span>Kalori Takibi</span>
                      </Link>
                      <Link
                        href="/gamification"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-[#2d7a4a]" />
                        <span>Rozetler & Liderlik</span>
                      </Link>
                      <Link
                        href="/partnerships"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#2d7a4a]" />
                        <span>Partnerler</span>
                      </Link>
                      <div className="border-t border-gray-100 my-2"></div>
                      <Link
                        href="/groups"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">👥</span>
                        <span>Gruplar</span>
                      </Link>
                      <Link
                        href="/challenges"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">🏆</span>
                        <span>Challenge'lar</span>
                      </Link>
                      <Link
                        href="/friend-suggestions"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">🦋</span>
                        <span>Arkadaş Önerileri</span>
                      </Link>
                      <div className="border-t border-gray-100 my-2"></div>
                      <Link
                        href="/crisis-stats"
                        onClick={() => setFeaturesMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">🆘</span>
                        <span>Kriz İstatistikleri</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {status === "loading" ? (
              <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#2d7a4a] to-[#4caf50] flex items-center justify-center text-white font-bold text-sm shadow-md">
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
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {session.user?.name || "Kullanıcı"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href={`/profile/${session.user?.username || session.user?.id}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profilim</span>
                    </Link>
                    <Link
                      href={`/profile/${session.user?.username || session.user?.id}/following`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Takip Edilenler</span>
                    </Link>
                    <Link
                      href="/takip-istekleri"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Takip İstekleri</span>
                    </Link>
                    {session.user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
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
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/submit"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Plan Ekle
              </Link>
              <Link
                href="/polls"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/polls"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                📊 Anketler
              </Link>
              <Link
                href="/recipes"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/recipes"
                  ? "bg-[#2d7a4a] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                🍽️ Sağlıklı Tarifler
              </Link>
              {session && (
                <>
                  <Link
                    href="/recipes/my-recipes"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/recipes/my-recipes"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📖 Tariflerim
                  </Link>
                  <Link
                    href="/collections"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/collections"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📁 Koleksiyonlar
                  </Link>
                  <Link
                    href="/progress"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/progress"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📸 Galeri
                  </Link>
                  <Link
                    href="/gamification"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/gamification"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🎮 Gamification
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/analytics"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    📊 İlerleme Takibi
                  </Link>
                  <Link
                    href="/calories"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/calories"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🍽️ Kalori Takibi
                  </Link>
                  <Link
                    href="/partnerships"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/partnerships"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🤝 Partnerler
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/groups"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/groups"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    👥 Gruplar
                  </Link>
                  <Link
                    href="/challenges"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/challenges"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🏆 Challenge'lar
                  </Link>
                  <Link
                    href="/friend-suggestions"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname === "/friend-suggestions"
                      ? "bg-[#2d7a4a] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    🦋 Arkadaş Önerileri
                  </Link>
                </>
              )}

              {status === "loading" ? (
                <div className="px-4 py-2">
                  <div className="w-full h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : session ? (
                <>
                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium transition-colors ${pathname.startsWith("/admin")
                        ? "bg-[#2d7a4a] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <Settings className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href={`/profile/${session.user?.username || session.user?.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#2d7a4a] to-[#4caf50] flex items-center justify-center text-white font-bold shadow-md">
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
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {session.user?.name || "Kullanıcı"}
                      </p>
                      <p className="text-xs text-gray-500">Profili Görüntüle</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full flex items-center justify-center gap-2">
                    <User className="w-4 h-4" />
                    Giriş Yap
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
