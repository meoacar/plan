"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const PLAN_REACTIONS = [
  { emoji: "💪", label: "Destekle", color: "from-blue-500 to-cyan-500" },
  { emoji: "🎉", label: "Tebrik et", color: "from-yellow-500 to-orange-500" },
  { emoji: "❤️", label: "Sevdim", color: "from-red-500 to-pink-500" },
  { emoji: "🔥", label: "Harika", color: "from-orange-500 to-red-500" },
  { emoji: "👏", label: "Alkış", color: "from-purple-500 to-pink-500" },
]

interface PlanReactionsProps {
  planId: string
  planSlug: string
  initialReactions?: Array<{
    emoji: string
    userId: string
    user: {
      id: string
      name: string
      image?: string
    }
  }>
}

export function PlanReactions({ planId, planSlug, initialReactions = [] }: PlanReactionsProps) {
  const { data: session } = useSession()
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  useEffect(() => {
    // İlk reaksiyonları hesapla
    const reactionCounts: Record<string, number> = {}
    const userReactionSet = new Set<string>()

    initialReactions.forEach((reaction) => {
      reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1
      if (session?.user?.id === reaction.userId) {
        userReactionSet.add(reaction.emoji)
      }
    })

    setReactions(reactionCounts)
    setUserReactions(userReactionSet)
  }, [initialReactions, session?.user?.id])

  const handleReaction = async (emoji: string, label: string) => {
    if (!session) {
      alert("Reaksiyon vermek için giriş yapmalısınız")
      return
    }

    if (loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/plans/${planSlug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, label, userId: session.user.id }),
      })

      if (!res.ok) {
        throw new Error("Reaksiyon eklenemedi")
      }

      const data = await res.json()

      // Optimistic update
      setReactions((prev) => {
        const newReactions = { ...prev }
        if (data.action === "added") {
          newReactions[emoji] = (newReactions[emoji] || 0) + 1
        } else {
          newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1)
          if (newReactions[emoji] === 0) {
            delete newReactions[emoji]
          }
        }
        return newReactions
      })

      setUserReactions((prev) => {
        const newSet = new Set(prev)
        if (data.action === "added") {
          newSet.add(emoji)
        } else {
          newSet.delete(emoji)
        }
        return newSet
      })
    } catch (error) {
      console.error("Reaction error:", error)
      alert("Reaksiyon eklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-4">
      {/* Toplam Reaksiyon Sayısı */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-semibold">{totalReactions}</span>
          <span>kişi bu plana reaksiyon verdi</span>
        </div>
      )}

      {/* Reaksiyon Butonları */}
      <div className="flex items-center gap-3 flex-wrap">
        {PLAN_REACTIONS.map(({ emoji, label, color }) => {
          const count = reactions[emoji] || 0
          const isActive = userReactions.has(emoji)
          const hasReactions = count > 0

          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji, label)}
              disabled={loading}
              onMouseEnter={() => setShowTooltip(emoji)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`
                group relative flex items-center gap-2 px-4 py-2.5 rounded-xl 
                transition-all duration-300 font-bold text-sm
                ${isActive
                  ? `bg-gradient-to-r ${color} text-white scale-105 shadow-lg`
                  : hasReactions
                    ? "bg-gray-800/80 border-2 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
                    : "bg-gray-800/50 border-2 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:bg-gray-800/70"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-105 hover:shadow-lg
              `}
            >
              <span className={`text-xl transition-transform ${isActive ? "animate-bounce" : "group-hover:scale-125"}`}>
                {emoji}
              </span>
              <span className="font-bold">{label}</span>
              {hasReactions && (
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? "bg-white/20" : "bg-gray-700"}
                `}>
                  {count}
                </span>
              )}
              
              {/* Tooltip */}
              {showTooltip === emoji && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-700 z-10">
                  {isActive ? `${label} verdin` : label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Reaksiyon Veren Kullanıcılar (İlk 5) */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <div className="flex -space-x-2">
            {initialReactions.slice(0, 5).map((reaction, index) => (
              <div
                key={`${reaction.userId}-${index}`}
                className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-900 shadow-lg"
                title={reaction.user.name || "Anonim"}
              >
                {reaction.user.image ? (
                  <img
                    src={reaction.user.image}
                    alt={reaction.user.name || "Profil"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{reaction.user.name?.[0]?.toUpperCase() || "?"}</span>
                )}
              </div>
            ))}
          </div>
          {totalReactions > 5 && (
            <span className="text-sm text-gray-400 font-medium">
              ve {totalReactions - 5} kişi daha
            </span>
          )}
        </div>
      )}
    </div>
  )
}
