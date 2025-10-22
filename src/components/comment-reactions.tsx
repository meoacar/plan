"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const EMOJIS = [
  { emoji: "💪", label: "Güçlü" },
  { emoji: "🔥", label: "Harika" },
  { emoji: "👏", label: "Alkış" },
  { emoji: "❤️", label: "Sevdim" },
  { emoji: "😊", label: "Mutlu" },
]

interface CommentReactionsProps {
  commentId: string
  initialReactions?: Array<{
    emoji: string
    userId: string
  }>
}

export function CommentReactions({ commentId, initialReactions = [] }: CommentReactionsProps) {
  const { data: session } = useSession()
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

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

  const handleReaction = async (emoji: string) => {
    if (!session) {
      alert("Reaksiyon vermek için giriş yapmalısınız")
      return
    }

    if (loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
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

  return (
    <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-gray-700/50">
      {EMOJIS.map(({ emoji, label }) => {
        const count = reactions[emoji] || 0
        const isActive = userReactions.has(emoji)
        const hasReactions = count > 0

        return (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            disabled={loading}
            title={label}
            className={`
              group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full 
              transition-all duration-200 font-semibold text-sm
              ${isActive
                ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 scale-105 shadow-lg shadow-purple-500/20"
                : hasReactions
                  ? "bg-gray-700/50 border border-gray-600 hover:border-purple-500/50 hover:bg-gray-700"
                  : "bg-gray-800/30 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-105
            `}
          >
            <span className={`text-lg transition-transform ${isActive ? "animate-bounce" : "group-hover:scale-110"}`}>
              {emoji}
            </span>
            {hasReactions && (
              <span className={`text-xs font-bold ${isActive ? "text-purple-300" : "text-gray-400"}`}>
                {count}
              </span>
            )}
            
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
