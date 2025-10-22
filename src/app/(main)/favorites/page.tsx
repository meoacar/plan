import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FavoritesList } from "@/components/favorites-list"

export const metadata = {
  title: "Favorilerim - Zayıflama Planım",
  description: "Kaydettiğiniz zayıflama planları",
}

export default async function FavoritesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      plan: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl">⭐</span>
            </div>
            <div>
              <h1 className="text-5xl font-black text-white mb-2">
                Favorilerim
              </h1>
              <p className="text-gray-400 text-lg">
                Kaydettiğiniz {favorites.length} plan
              </p>
            </div>
          </div>
        </div>

        <FavoritesList initialFavorites={favorites} />
      </div>
    </div>
  )
}
