import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanCard } from "@/components/plan-card"
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
    : activeBackground?.colors?.gradient
    ? { background: activeBackground.colors.gradient }
    : {}

  return (
    <div className={`container mx-auto px-4 py-8 max-w-6xl ${activeTheme?.cssClass || ''}`}>
      {/* Modern Cover & Profile Section */}
      <div className="relative mb-8">
        {/* Cover Image with Custom Background */}
        <div 
          className="h-48 md:h-64 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl shadow-2xl relative overflow-hidden"
          style={Object.keys(backgroundStyle).length > 0 ? backgroundStyle : undefined}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        {/* Profile Card Overlay */}
        <Card className="relative -mt-20 mx-4 md:mx-8 shadow-2xl border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar with Custom Frame */}
              <div className="relative profile-avatar-container">
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-xl ring-8 ring-white bg-gradient-to-br from-emerald-400 to-teal-600 ${activeFrame?.cssClass || ''}`}>
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name || "Profil"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-5xl md:text-6xl">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                {/* Profile Badges */}
                {customization.activeBadges && customization.activeBadges.length > 0 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {customization.activeBadges.map((badge: any, index: number) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center border-2 border-white"
                        title={badge.name}
                      >
                        {badge.imageUrl ? (
                          <img src={badge.imageUrl} alt={badge.name} className="w-5 h-5" />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {badge.name[0]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
                {isOwnProfile && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                    <Link href="/profile/edit">
                      <Button size="sm" className="rounded-full h-10 w-10 p-0">
                        ✏️
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {user.name || "Anonim Kullanıcı"}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {!isOwnProfile && <FollowButton userId={user.id} />}
                    {isOwnProfile && (
                      <div className="hidden md:flex items-center gap-2">
                        <Link href="/favorites">
                          <Button variant="outline" size="sm" className="font-semibold">
                            ⭐ Favorilerim
                          </Button>
                        </Link>
                        <Link href="/profile/edit">
                          <Button variant="outline" size="sm" className="font-semibold">
                            ✏️ Düzenle
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 flex items-center justify-center md:justify-start gap-2">
                  <span className="text-lg">📅</span>
                  <span>Üyelik: {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                  })}</span>
                </p>

                {/* Follow Stats */}
                <div className="mb-4 flex justify-center md:justify-start">
                  <UserFollowStats 
                    userId={user.id}
                    initialFollowersCount={user._count.followers}
                    initialFollowingCount={user._count.following}
                  />
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mb-4">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-blue-600">{user._count.plans}</span>
                    <span className="text-sm font-medium text-blue-900">Plan</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-red-600">{user._count.likes}</span>
                    <span className="text-sm font-medium text-red-900">Beğeni</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-green-600">{user._count.comments}</span>
                    <span className="text-sm font-medium text-green-900">Yorum</span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex md:hidden justify-center gap-2">
                  {!isOwnProfile && <FollowButton userId={user.id} />}
                  {isOwnProfile && (
                    <>
                      <Link href="/favorites">
                        <Button variant="outline" size="sm" className="font-semibold">
                          ⭐ Favorilerim
                        </Button>
                      </Link>
                      <Link href="/profile/edit">
                        <Button variant="outline" size="sm" className="font-semibold">
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
          {/* About Section */}
          {user.bio && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Hakkında
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Goals Section */}
          {(user.startWeight || user.goalWeight) && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Hedefler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.startWeight && (
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl">
                    <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                      Başlangıç Kilosu
                    </div>
                    <div className="text-3xl font-bold text-purple-900">
                      {user.startWeight} <span className="text-lg">kg</span>
                    </div>
                  </div>
                )}

                {user.goalWeight && (
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl">
                    <div className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">
                      Hedef Kilo
                    </div>
                    <div className="text-3xl font-bold text-pink-900">
                      {user.goalWeight} <span className="text-lg">kg</span>
                    </div>
                  </div>
                )}

                {weightDiff && weightDiff > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1">
                      Hedef Fark
                    </div>
                    <div className="text-2xl font-bold">
                      -{weightDiff} kg
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Media Section */}
          {(user.instagram || user.twitter || user.youtube || user.tiktok || user.website) && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">🌐</span>
                  Sosyal Medya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.instagram && (
                    <a
                      href={user.instagram.startsWith('http') ? user.instagram : `https://instagram.com/${user.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all group"
                    >
                      <span className="text-xl">📷</span>
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">Instagram</span>
                    </a>
                  )}
                  {user.twitter && (
                    <a
                      href={user.twitter.startsWith('http') ? user.twitter : `https://twitter.com/${user.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-black text-white hover:shadow-lg transition-all group"
                    >
                      <span className="text-xl">🐦</span>
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">Twitter/X</span>
                    </a>
                  )}
                  {user.youtube && (
                    <a
                      href={user.youtube.startsWith('http') ? user.youtube : `https://youtube.com/${user.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-red-600 text-white hover:shadow-lg transition-all group"
                    >
                      <span className="text-xl">📺</span>
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">YouTube</span>
                    </a>
                  )}
                  {user.tiktok && (
                    <a
                      href={user.tiktok.startsWith('http') ? user.tiktok : `https://tiktok.com/${user.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 text-white hover:shadow-lg transition-all group"
                    >
                      <span className="text-xl">🎵</span>
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">TikTok</span>
                    </a>
                  )}
                  {user.website && (
                    <a
                      href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 text-white hover:shadow-lg transition-all group"
                    >
                      <span className="text-xl">🌍</span>
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">Website</span>
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
  )
}
