import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import FollowButton from "@/components/follow-button"
import UserFollowStats from "@/components/user-follow-stats"
import WallPosts from "@/components/wall-posts"
import { ProfileTabs } from "@/components/profile-tabs"
import { getUserCustomization } from "@/lib/unlock-customization"

interface PageProps {
  params: Promise<{ userId: string }>
}

async function getUser(userIdOrUsername: string, isOwnProfile: boolean = false) {
  // Username veya ID ile kullanıcıyı bul
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: userIdOrUsername },
        { username: userIdOrUsername }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      startWeight: true,
      goalWeight: true,
      instagram: true,
      twitter: true,
      youtube: true,
      tiktok: true,
      website: true,
      createdAt: true,
      plans: {
        // Kendi profilinde tüm planları göster, başkasının profilinde sadece onaylanmışları
        where: isOwnProfile ? undefined : { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
      _count: {
        select: {
          plans: { where: { status: "APPROVED" } },
          comments: true,
          likes: true,
        },
      },
      polls: {
        where: isOwnProfile ? undefined : { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          options: {
            orderBy: { order: "asc" },
            include: {
              _count: {
                select: { votes: true },
              },
            },
          },
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  })

  if (!user) return null

  // Takipçi ve takip sayılarını ayrı olarak al
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
  ])

  return {
    ...user,
    _count: {
      ...user._count,
      followers: followersCount,
      following: followingCount,
    },
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params
  const user = await getUser(userId, false)

  if (!user) {
    return {
      title: "Kullanıcı Bulunamadı",
    }
  }

  return {
    title: `${user.name || "Kullanıcı"} - Zayıflama Planım`,
    description: user.bio || `${user.name || "Kullanıcı"} profili ve planları`,
  }
}

// Revalidate every 5 minutes
export const revalidate = 300

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params
  const session = await auth()
  
  // İlk kontrol - userId veya username ile eşleşme
  let isOwnProfile = session?.user?.id === userId || session?.user?.username === userId
  
  const user = await getUser(userId, isOwnProfile)

  if (!user) {
    notFound()
  }

  // User bulunduktan sonra kesin kontrol - ID ile
  isOwnProfile = session?.user?.id === user.id

  const weightDiff = user.startWeight && user.goalWeight ? user.startWeight - user.goalWeight : null

  // Planları duruma göre ayır (sadece kendi profilinde)
  const approvedPlans = user.plans.filter((p: any) => p.status === "APPROVED")
  const pendingPlans = isOwnProfile ? user.plans.filter((p: any) => p.status === "PENDING") : []
  const rejectedPlans = isOwnProfile ? user.plans.filter((p: any) => p.status === "REJECTED") : []

  // Profil özelleştirmelerini getir
  const customization = await getUserCustomization(user.id)
  const activeTheme = customization.activeTheme
  const activeBackground = customization.activeBackground
  const activeFrame = customization.activeFrame

  // Arka plan stilini belirle
  const backgroundStyle = activeBackground?.imageUrl
    ? { backgroundImage: `url(${activeBackground.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : activeBackground?.colors && typeof activeBackground.colors === 'object' && 'gradient' in activeBackground.colors
    ? { background: (activeBackground.colors as any).gradient }
    : {}

  // Tema renklerini CSS değişkenleri olarak ayarla
  const themeColors = activeTheme?.colors && typeof activeTheme.colors === 'object' ? activeTheme.colors as any : null
  const themeStyle = themeColors ? {
    '--theme-primary': themeColors.primary || '#10b981',
    '--theme-secondary': themeColors.secondary || '#3b82f6',
    '--theme-accent': themeColors.accent || '#8b5cf6',
    '--theme-background': themeColors.background || '#ffffff',
    '--theme-text': themeColors.text || '#1f2937',
  } as React.CSSProperties : {}

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${activeTheme?.cssClass || ''}`}
      style={{
        ...themeStyle,
        backgroundColor: themeColors?.background || '#f9fafb',
        color: themeColors?.text || '#1f2937',
      }}
    >
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: themeColors 
              ? `radial-gradient(circle, ${themeColors.primary} 0%, transparent 70%)`
              : 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            animationDuration: '8s',
          }}
        ></div>
        <div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: themeColors 
              ? `radial-gradient(circle, ${themeColors.accent} 0%, transparent 70%)`
              : 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            animationDuration: '10s',
            animationDelay: '2s',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
      {/* Modern Cover & Profile Section */}
      <div className="relative mb-8 group">
        {/* Cover Image with Custom Background */}
        <div 
          className="h-56 md:h-80 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
          style={{
            ...(Object.keys(backgroundStyle).length > 0 ? backgroundStyle : {
              background: themeColors 
                ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 50%, ${themeColors.accent} 100%)`
                : 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)'
            })
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Profile Card Overlay - Glassmorphism */}
        <Card 
          className="relative -mt-24 md:-mt-32 mx-4 md:mx-8 shadow-2xl border-0 backdrop-blur-xl bg-white/80 transition-all duration-500 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1"
          style={{
            backgroundColor: themeColors?.background ? `${themeColors.background}cc` : 'rgba(255, 255, 255, 0.8)',
            borderColor: themeColors?.primary ? `${themeColors.primary}20` : 'transparent',
          }}
        >
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar with Custom Frame */}
              <div className="relative profile-avatar-container group/avatar">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-75 group-hover/avatar:opacity-100 transition duration-500 animate-pulse"></div>
                <div className={`relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl ring-4 ring-white bg-gradient-to-br from-emerald-400 to-teal-600 transition-all duration-500 group-hover/avatar:scale-105 ${activeFrame?.cssClass || ''}`}>
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name || "Profil"} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-6xl md:text-7xl">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                {/* Profile Badges */}
                {customization.activeBadges && customization.activeBadges.length > 0 && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {customization.activeBadges.map((badge: any, index: number) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-xl flex items-center justify-center border-3 border-white transition-all duration-300 hover:scale-125 hover:rotate-12 cursor-pointer"
                        title={badge.name}
                        style={{
                          animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      >
                        {badge.imageUrl ? (
                          <img src={badge.imageUrl} alt={badge.name} className="w-6 h-6" />
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {badge.name[0]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isOwnProfile && (
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12">
                    <Link href="/profile/edit">
                      <Button size="sm" className="rounded-full h-12 w-12 p-0 bg-white hover:bg-gray-50 text-2xl">
                        ✏️
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 
                    className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent animate-gradient"
                    style={{
                      backgroundImage: themeColors 
                        ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 50%, ${themeColors.accent} 100%)`
                        : undefined,
                    }}
                  >
                    {user.name || "Anonim Kullanıcı"}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {!isOwnProfile && <FollowButton userId={user.id} />}
                    {isOwnProfile && (
                      <div className="hidden md:flex items-center gap-2">
                        <Link href="/favorites">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border-2"
                            style={{
                              borderColor: themeColors?.accent || '#f59e0b',
                              color: themeColors?.accent || '#f59e0b',
                            }}
                          >
                            ⭐ Favorilerim
                          </Button>
                        </Link>
                        <Link href="/profile/edit">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border-2"
                            style={{
                              borderColor: themeColors?.primary || '#3b82f6',
                              color: themeColors?.primary || '#3b82f6',
                            }}
                          >
                            ✏️ Düzenle
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: themeColors ? `${themeColors.primary}15` : 'rgba(59, 130, 246, 0.1)',
                    }}
                  >
                    <span className="text-2xl">📅</span>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: themeColors?.text || '#374151' }}
                    >
                      {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                </div>

                {/* Follow Stats */}
                <div className="mb-6 flex justify-center md:justify-start">
                  <UserFollowStats 
                    userId={user.id}
                    initialFollowersCount={user._count.followers}
                    initialFollowingCount={user._count.following}
                  />
                </div>

                {/* Stats Row - Enhanced */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mb-6">
                  <div 
                    className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: themeColors ? `${themeColors.primary}20` : 'rgba(37, 99, 235, 0.15)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative">
                      <div 
                        className="text-3xl font-black"
                        style={{ color: themeColors?.primary || '#2563eb' }}
                      >
                        {user._count.plans}
                      </div>
                      <div 
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: themeColors?.text || '#1e3a8a' }}
                      >
                        Plan
                      </div>
                    </div>
                    <div className="text-3xl">📋</div>
                  </div>
                  
                  <div 
                    className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: themeColors ? `${themeColors.accent}20` : 'rgba(220, 38, 38, 0.15)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative">
                      <div 
                        className="text-3xl font-black"
                        style={{ color: themeColors?.accent || '#dc2626' }}
                      >
                        {user._count.likes}
                      </div>
                      <div 
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: themeColors?.text || '#7f1d1d' }}
                      >
                        Beğeni
                      </div>
                    </div>
                    <div className="text-3xl animate-pulse">❤️</div>
                  </div>
                  
                  <div 
                    className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: themeColors ? `${themeColors.secondary}20` : 'rgba(22, 163, 74, 0.15)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative">
                      <div 
                        className="text-3xl font-black"
                        style={{ color: themeColors?.secondary || '#16a34a' }}
                      >
                        {user._count.comments}
                      </div>
                      <div 
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: themeColors?.text || '#14532d' }}
                      >
                        Yorum
                      </div>
                    </div>
                    <div className="text-3xl">💬</div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex md:hidden justify-center gap-3 mt-4">
                  {!isOwnProfile && <FollowButton userId={user.id} />}
                  {isOwnProfile && (
                    <>
                      <Link href="/favorites">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-semibold transition-all duration-300 hover:scale-105 border-2"
                          style={{
                            borderColor: themeColors?.accent || '#f59e0b',
                            color: themeColors?.accent || '#f59e0b',
                          }}
                        >
                          ⭐ Favorilerim
                        </Button>
                      </Link>
                      <Link href="/profile/edit">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-semibold transition-all duration-300 hover:scale-105 border-2"
                          style={{
                            borderColor: themeColors?.primary || '#3b82f6',
                            color: themeColors?.primary || '#3b82f6',
                          }}
                        >
                          ✏️ Düzenle
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - About & Goals */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wall Posts */}
          <WallPosts userId={user.id} isOwnProfile={isOwnProfile} />
          {/* About Section - Glassmorphism */}
          {user.bio && (
            <Card 
              className="group shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-white/90 border-2 hover:-translate-y-1 overflow-hidden relative"
              style={{
                backgroundColor: themeColors?.background ? `${themeColors.background}e6` : 'rgba(255, 255, 255, 0.9)',
                borderColor: themeColors?.primary ? `${themeColors.primary}40` : 'rgba(59, 130, 246, 0.3)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="pb-3 relative z-10">
                <CardTitle 
                  className="text-xl font-extrabold flex items-center gap-3"
                  style={{ color: themeColors?.primary || '#1f2937' }}
                >
                  <span className="text-3xl animate-bounce">📝</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Hakkında
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p 
                  className="leading-relaxed text-base"
                  style={{ color: themeColors?.text || '#374151' }}
                >
                  {user.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Goals Section - Enhanced */}
          {(user.startWeight || user.goalWeight) && (
            <Card 
              className="group shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm border-2 hover:-translate-y-1 overflow-hidden relative"
              style={{
                background: themeColors 
                  ? `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.accent}15 100%)`
                  : 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                borderColor: themeColors?.accent ? `${themeColors.accent}50` : 'rgba(233, 213, 255, 0.5)',
              }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="pb-3 relative z-10">
                <CardTitle 
                  className="text-xl font-extrabold flex items-center gap-3"
                  style={{ color: themeColors?.primary || '#7c3aed' }}
                >
                  <span className="text-3xl animate-pulse">🎯</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Hedefler
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                {user.startWeight && (
                  <div 
                    className="group/item backdrop-blur-md p-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-white/50"
                    style={{
                      backgroundColor: themeColors?.background ? `${themeColors.background}f0` : 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    <div 
                      className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"
                      style={{ color: themeColors?.primary || '#7c3aed' }}
                    >
                      <span className="text-lg">⚖️</span>
                      Başlangıç Kilosu
                    </div>
                    <div 
                      className="text-4xl font-black"
                      style={{ color: themeColors?.text || '#581c87' }}
                    >
                      {user.startWeight} <span className="text-xl font-bold opacity-70">kg</span>
                    </div>
                  </div>
                )}

                {user.goalWeight && (
                  <div 
                    className="group/item backdrop-blur-md p-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-white/50"
                    style={{
                      backgroundColor: themeColors?.background ? `${themeColors.background}f0` : 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    <div 
                      className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"
                      style={{ color: themeColors?.accent || '#db2777' }}
                    >
                      <span className="text-lg">🏆</span>
                      Hedef Kilo
                    </div>
                    <div 
                      className="text-4xl font-black"
                      style={{ color: themeColors?.text || '#831843' }}
                    >
                      {user.goalWeight} <span className="text-xl font-bold opacity-70">kg</span>
                    </div>
                  </div>
                )}

                {weightDiff && weightDiff > 0 && (
                  <div 
                    className="relative text-white p-6 rounded-2xl text-center overflow-hidden group/diff transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{
                      background: themeColors 
                        ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
                        : 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/diff:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        <span className="text-lg">🔥</span>
                        Hedef Fark
                      </div>
                      <div className="text-5xl font-black animate-pulse">
                        -{weightDiff} <span className="text-2xl">kg</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Media Section - Enhanced */}
          {(user.instagram || user.twitter || user.youtube || user.tiktok || user.website) && (
            <Card 
              className="group shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-white/90 border-2 hover:-translate-y-1 overflow-hidden relative"
              style={{
                backgroundColor: themeColors?.background ? `${themeColors.background}e6` : 'rgba(255, 255, 255, 0.9)',
                borderColor: themeColors?.secondary ? `${themeColors.secondary}40` : 'rgba(34, 197, 94, 0.3)',
              }}
            >
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="pb-3 relative z-10">
                <CardTitle 
                  className="text-xl font-extrabold flex items-center gap-3"
                  style={{ color: themeColors?.secondary || '#1f2937' }}
                >
                  <span className="text-3xl animate-spin" style={{ animationDuration: '3s' }}>🌐</span>
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Sosyal Medya
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {user.instagram && (
                    <a
                      href={user.instagram.startsWith('http') ? user.instagram : `https://instagram.com/${user.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:shadow-2xl transition-all duration-300 group/link hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                      <span className="text-2xl relative z-10">📷</span>
                      <span className="font-bold text-lg relative z-10 group-hover/link:translate-x-2 transition-transform">Instagram</span>
                    </a>
                  )}
                  {user.twitter && (
                    <a
                      href={user.twitter.startsWith('http') ? user.twitter : `https://twitter.com/${user.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-2xl transition-all duration-300 group/link hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                      <span className="text-2xl relative z-10">🐦</span>
                      <span className="font-bold text-lg relative z-10 group-hover/link:translate-x-2 transition-transform">Twitter/X</span>
                    </a>
                  )}
                  {user.youtube && (
                    <a
                      href={user.youtube.startsWith('http') ? user.youtube : `https://youtube.com/${user.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-2xl transition-all duration-300 group/link hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                      <span className="text-2xl relative z-10">📺</span>
                      <span className="font-bold text-lg relative z-10 group-hover/link:translate-x-2 transition-transform">YouTube</span>
                    </a>
                  )}
                  {user.tiktok && (
                    <a
                      href={user.tiktok.startsWith('http') ? user.tiktok : `https://tiktok.com/${user.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white hover:shadow-2xl transition-all duration-300 group/link hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                      <span className="text-2xl relative z-10">🎵</span>
                      <span className="font-bold text-lg relative z-10 group-hover/link:translate-x-2 transition-transform">TikTok</span>
                    </a>
                  )}
                  {user.website && (
                    <a
                      href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-2xl transition-all duration-300 group/link hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                      <span className="text-2xl relative z-10">🌍</span>
                      <span className="font-bold text-lg relative z-10 group-hover/link:translate-x-2 transition-transform">Website</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Plans & Tabs */}
        <div className="lg:col-span-2">
          <ProfileTabs
            isOwnProfile={isOwnProfile}
            approvedPlans={approvedPlans}
            pendingPlans={pendingPlans}
            rejectedPlans={rejectedPlans}
            polls={user.polls || []}
            userId={user.id}
          />
        </div>
      </div>
    </div>
    </div>
  )
}
