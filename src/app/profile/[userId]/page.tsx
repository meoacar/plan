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
      Plan: {
        // Kendi profilinde tüm planları göster, başkasının profilinde sadece onaylanmışları
        where: isOwnProfile ? undefined : { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              Like: true,
              Comment_Comment_planIdToPlan: true,
            },
          },
        },
      },
      _count: {
        select: {
          Plan: { where: { status: "APPROVED" } },
          Comment_Comment_userIdToUser: true,
          Like: true,
        },
      },
      Poll: {
        where: isOwnProfile ? undefined : { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          PollOption: {
            orderBy: { order: "asc" },
            include: {
              _count: {
                select: { PollVote: true },
              },
            },
          },
          _count: {
            select: { PollVote: true },
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
  // Prisma'dan gelen User'ı user'a dönüştür (PlanCard için)
  // Date objelerini string'e çevir (client component'e geçmek için)
  const transformPlan = (p: any) => ({
    ...p,
    user: p.User,
    _count: { likes: p._count.Like, comments: p._count.Comment_Comment_planIdToPlan },
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  })
  const approvedPlans = user.Plan.filter((p: any) => p.status === "APPROVED").map(transformPlan)
  const pendingPlans = isOwnProfile ? user.Plan.filter((p: any) => p.status === "PENDING").map(transformPlan) : []
  const rejectedPlans = isOwnProfile ? user.Plan.filter((p: any) => p.status === "REJECTED").map(transformPlan) : []

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
          {/* Cover Image with Custom Background - Enhanced */}
          <div
            className="h-64 md:h-96 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)] group-hover:scale-[1.01]"
            style={{
              ...(Object.keys(backgroundStyle).length > 0 ? backgroundStyle : {
                background: themeColors
                  ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 50%, ${themeColors.accent} 100%)`
                  : 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)'
              })
            }}
          >
            {/* Overlay Gradients for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5"></div>

            {/* Animated Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

            {/* Floating Particles - More Dynamic */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-3 h-3 bg-white/50 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
              <div className="absolute top-20 right-20 w-4 h-4 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
              <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-white/50 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/60 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-10 right-10 w-3 h-3 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-8 left-8 flex gap-2">
              <div className="w-16 h-1 bg-white/30 rounded-full animate-pulse"></div>
              <div className="w-8 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="absolute bottom-8 right-8 flex gap-2">
              <div className="w-8 h-1 bg-white/20 rounded-full animate-pulse"></div>
              <div className="w-16 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out"></div>
          </div>

          {/* Profile Card Overlay - Enhanced Glassmorphism */}
          <Card
            className="relative -mt-28 md:-mt-40 mx-4 md:mx-8 shadow-2xl border-2 backdrop-blur-2xl bg-white/85 transition-all duration-500 hover:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-2 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: themeColors?.background ? `${themeColors.background}d9` : 'rgba(255, 255, 255, 0.85)',
              borderColor: themeColors?.primary ? `${themeColors.primary}30` : 'rgba(59, 130, 246, 0.2)',
            }}
          >
            <CardContent className="p-6 md:p-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar with Custom Frame - Enhanced */}
                <div className="relative profile-avatar-container group/avatar">
                  {/* Animated Glow Ring */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-lg opacity-75 group-hover/avatar:opacity-100 transition duration-500 animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full blur opacity-60 group-hover/avatar:opacity-90 transition duration-700" style={{ animationDelay: '0.5s' }}></div>

                  {/* Avatar Container */}
                  <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl ring-4 ring-white bg-gradient-to-br from-emerald-400 to-teal-600 transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:rotate-3 ${activeFrame?.cssClass || ''}`}>
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "Profil"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-6xl md:text-8xl">
                        {user.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover/avatar:translate-x-full transition-transform duration-1000"></div>
                  </div>
                  {/* Profile Badges - Enhanced */}
                  {customization.activeBadges && customization.activeBadges.length > 0 && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                      {customization.activeBadges.map((badge: any, index: number) => (
                        <div
                          key={index}
                          className="relative group/badge"
                        >
                          {/* Badge Glow */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur opacity-75 group-hover/badge:opacity-100 transition duration-300"></div>
                          {/* Badge */}
                          <div
                            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl flex items-center justify-center border-4 border-white transition-all duration-300 hover:scale-125 hover:rotate-12 cursor-pointer"
                            title={badge.name}
                            style={{
                              animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                              animationDelay: `${index * 0.2}s`,
                            }}
                          >
                            {badge.imageUrl ? (
                              <img src={badge.imageUrl} alt={badge.name} className="w-7 h-7" />
                            ) : (
                              <span className="text-white text-base font-bold">
                                {badge.name[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isOwnProfile && (
                    <div className="absolute -bottom-4 -right-4 group/edit">
                      {/* Edit Button Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-75 group-hover/edit:opacity-100 transition duration-300 animate-pulse"></div>
                      {/* Edit Button */}
                      <Link 
                        href="/profile/edit"
                        className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1.5 shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 inline-flex items-center justify-center"
                      >
                        <div className="rounded-full h-14 w-14 flex items-center justify-center bg-white hover:bg-gray-50 text-3xl shadow-lg">
                          ✏️
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* User Info - Enhanced */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                    <div className="relative inline-block">
                      {/* Name Glow Effect */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse"></div>
                      <h1
                        className="relative text-4xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent animate-gradient tracking-tight"
                        style={{
                          backgroundImage: themeColors
                            ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 50%, ${themeColors.accent} 100%)`
                            : undefined,
                        }}
                      >
                        {user.name || "Anonim Kullanıcı"}
                      </h1>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      {!isOwnProfile && <FollowButton userId={user.id} />}
                      {isOwnProfile && (
                        <div className="hidden md:flex items-center gap-2">
                          <Link 
                            href="/favorites"
                            className="inline-flex items-center justify-center font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 rounded-md px-3 py-2 text-sm"
                            style={{
                              borderColor: themeColors?.accent || '#f59e0b',
                              color: themeColors?.accent || '#f59e0b',
                            }}
                          >
                            ⭐ Favorilerim
                          </Link>
                          <Link 
                            href="/profile/edit"
                            className="inline-flex items-center justify-center font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 rounded-md px-3 py-2 text-sm"
                            style={{
                              borderColor: themeColors?.primary || '#3b82f6',
                              color: themeColors?.primary || '#3b82f6',
                            }}
                          >
                            ✏️ Düzenle
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Since Badge - Enhanced */}
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                    <div
                      className="relative group/date flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-lg border-2 border-white/50 overflow-hidden"
                      style={{
                        backgroundColor: themeColors ? `${themeColors.primary}20` : 'rgba(59, 130, 246, 0.15)',
                      }}
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/date:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative text-3xl animate-bounce" style={{ animationDuration: '2s' }}>📅</span>
                      <div className="relative">
                        <div className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: themeColors?.text || '#374151' }}>
                          Üye Olma
                        </div>
                        <div
                          className="text-sm font-black"
                          style={{ color: themeColors?.text || '#374151' }}
                        >
                          {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                          })}
                        </div>
                      </div>
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

                  {/* Stats Row - Super Enhanced */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-5 mb-8">
                    <div
                      className="group relative flex items-center gap-4 px-7 py-4 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer overflow-hidden border-2 border-white/30"
                      style={{
                        backgroundColor: themeColors ? `${themeColors.primary}25` : 'rgba(37, 99, 235, 0.2)',
                      }}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">📋</div>
                      <div className="relative">
                        <div
                          className="text-4xl font-black leading-none mb-1"
                          style={{ color: themeColors?.primary || '#2563eb' }}
                        >
                          {user._count.plans}
                        </div>
                        <div
                          className="text-xs font-black uppercase tracking-widest"
                          style={{ color: themeColors?.text || '#1e3a8a' }}
                        >
                          Plan
                        </div>
                      </div>
                    </div>

                    <div
                      className="group relative flex items-center gap-4 px-7 py-4 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer overflow-hidden border-2 border-white/30"
                      style={{
                        backgroundColor: themeColors ? `${themeColors.accent}25` : 'rgba(220, 38, 38, 0.2)',
                      }}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="text-4xl animate-pulse transform group-hover:scale-125 transition-all duration-300">❤️</div>
                      <div className="relative">
                        <div
                          className="text-4xl font-black leading-none mb-1"
                          style={{ color: themeColors?.accent || '#dc2626' }}
                        >
                          {user._count.likes}
                        </div>
                        <div
                          className="text-xs font-black uppercase tracking-widest"
                          style={{ color: themeColors?.text || '#7f1d1d' }}
                        >
                          Beğeni
                        </div>
                      </div>
                    </div>

                    <div
                      className="group relative flex items-center gap-4 px-7 py-4 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer overflow-hidden border-2 border-white/30"
                      style={{
                        backgroundColor: themeColors ? `${themeColors.secondary}25` : 'rgba(22, 163, 74, 0.2)',
                      }}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="text-4xl transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">💬</div>
                      <div className="relative">
                        <div
                          className="text-4xl font-black leading-none mb-1"
                          style={{ color: themeColors?.secondary || '#16a34a' }}
                        >
                          {user._count.comments}
                        </div>
                        <div
                          className="text-xs font-black uppercase tracking-widest"
                          style={{ color: themeColors?.text || '#14532d' }}
                        >
                          Yorum
                        </div>
                      </div>
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
              polls={(user.Poll || []).map((poll: any) => ({
                ...poll,
                createdAt: poll.createdAt.toISOString(),
                updatedAt: poll.updatedAt.toISOString(),
                endsAt: poll.endsAt ? poll.endsAt.toISOString() : null,
              }))}
              userId={user.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
