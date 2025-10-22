"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Heart, MessageCircle, TrendingDown } from "lucide-react"
import FollowButton from "./follow-button"
import { useSession } from "next-auth/react"

interface PlanCardProps {
  plan: {
    id: string
    title: string
    slug: string
    startWeight: number
    goalWeight: number
    durationText: string
    imageUrl: string | null
    views: number
    user: {
      id: string
      name: string | null
      image: string | null
    }
    _count: {
      likes: number
      comments: number
    }
  }
}

export function PlanCard({ plan }: PlanCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const weightLoss = plan.startWeight - plan.goalWeight

  // Rastgele arka plan deseni seç (plan ID'sine göre tutarlı olsun)
  const patterns = [
    "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzMzZWEiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0aDB2Mmg0djRoMlYzNmg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')]",
    "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlYzQ4OTkiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDIwdjIwSDBWMHptMjAgMjBoMjB2MjBIMjBWMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]",
    "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iNSIvPjxjaXJjbGUgY3g9IjU1IiBjeT0iNTUiIHI9IjUiLz48L2c+PC9nPjwvc3ZnPg==')]",
    "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNTllMGIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMjUgMjVsMjUtMjVIMHY1MGg1MFYweiIvPjwvZz48L2c+PC9zdmc+')]",
    "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDIwTDIwIDIwSDBWMHptMjAgMjBoMjBMNDAgNDBIMjBWMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]",
    "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzAgMGwzMCAzMC0zMCAzMEwwIDMweiIvPjwvZz48L2c+PC9zdmc+')]",
  ]
  
  const gradients = [
    "from-purple-50 to-pink-50",
    "from-blue-50 to-cyan-50",
    "from-emerald-50 to-teal-50",
    "from-orange-50 to-amber-50",
    "from-rose-50 to-pink-50",
    "from-indigo-50 to-purple-50",
  ]

  // Plan ID'den sayı üret (tutarlı olması için)
  const patternIndex = parseInt(plan.id.slice(-1), 16) % patterns.length
  const gradientIndex = parseInt(plan.id.slice(-2), 16) % gradients.length

  return (
    <Link href={`/plan/${plan.slug}`} className="block h-full">
      <article className="group relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-purple-400 hover:-translate-y-2">
        
        {/* Background Pattern */}
        <div className={`absolute inset-0 ${patterns[patternIndex]} opacity-100`}></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradientIndex]}`}></div>
        
        {/* Gradient Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
        
        <div className="relative p-6">
          
          {/* Header - User Info */}
          <div className="flex items-center justify-between mb-4">
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/profile/${plan.user.id}`)
              }}
              className="flex items-center gap-3 cursor-pointer group/user flex-1 min-w-0"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-purple-100 group-hover/user:ring-purple-300 transition-all flex-shrink-0">
                {plan.user.image ? (
                  <img 
                    src={plan.user.image} 
                    alt={plan.user.name || "Profil"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{plan.user.name?.[0]?.toUpperCase() || "?"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover/user:text-purple-600 transition-colors truncate">
                  {plan.user.name || "Anonim"}
                </p>
                <p className="text-xs text-gray-500 truncate">{plan.durationText}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Follow Button */}
              {session?.user?.id && session.user.id !== plan.user.id && (
                <div
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <FollowButton userId={plan.user.id} variant="compact" />
                </div>
              )}
              
              {/* Views Badge */}
              <div className="flex items-center gap-1 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <Eye className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-bold text-gray-700">{plan.views}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-4 leading-tight group-hover:text-purple-600 transition-colors min-h-[56px]">
            {plan.title}
          </h3>

          {/* Main Stats - Business Card Style */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 mb-4 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              
              {/* Weight Loss */}
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="w-5 h-5 text-purple-600" />
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {weightLoss}
                  </span>
                  <span className="text-sm font-bold text-gray-600">kg</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Verilen Kilo</p>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-purple-200 to-transparent mx-3"></div>

              {/* Before/After */}
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xl font-black text-gray-700">{plan.startWeight}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-xl font-black text-emerald-600">{plan.goalWeight}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Başlangıç → Hedef</p>
              </div>
            </div>
          </div>

          {/* Image Preview - Optional */}
          {plan.imageUrl && (
            <div className="relative h-32 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-purple-100 to-pink-100">
              <img
                src={plan.imageUrl}
                alt={plan.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-gray-700">{plan._count.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-gray-700">{plan._count.comments}</span>
              </div>
            </div>
            
            <div className="text-xs font-semibold text-purple-600 group-hover:text-purple-700 flex items-center gap-1">
              Detayları Gör
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
