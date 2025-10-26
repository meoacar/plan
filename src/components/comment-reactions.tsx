"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const EMOJIS = [
  { emoji: "💪", label: "Destekle", color: "from-blue-500 to-cyan-500" },
  { emoji: "🎉", label: "Tebrik et", color: "from-yellow-500 to-orange-500" },
  { emoji: "❤️", label: "Sevdim", color: "from-red-500 to-pink-500" },
  { emoji: "🔥", label: "Harika", color: "from-orange-500 to-red-500" },
  { emoji: "👏", label: "Alkış", color: "from-purple-500 to-pink-500" },
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
          // Eğer başka reaksiyonlar kaldırıldıysa, onları da UI'dan kaldır
          if (data.removedOthers) {
            // Kullanıcının önceki reaksiyonlarını bul ve sayılarını azalt
            userReactions.forEach((oldEmoji) => {
              if (oldEmoji !== emoji) {
                newReactions[oldEmoji] = Math.max(0, (newReactions[oldEmoji] || 0) - 1)
                if (newReactions[oldEmoji] === 0) {
                  delete newReactions[oldEmoji]
                }
              }
            })
          }
          // Yeni reaksiyonu ekle
          newReactions[emoji] = (newReactions[emoji] || 0) + 1
        } else {
          // Reaksiyon kaldırıldı
          newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1)
          if (newReactions[emoji] === 0) {
            delete newReactions[emoji]
          }
        }
        return newReactions
      })

      setUserReactions((prev) => {
        const newSet = new Set<string>()
        if (data.action === "added") {
          // Sadece yeni emoji'yi ekle (öncekiler temizlendi)
          newSet.add(emoji)
        }
        // action === "removed" ise set boş kalır
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
      {EMOJIS.map(({ emoji, label, color }) => {
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
              transition-all duration-300 font-bold text-sm
              ${isActive
                ? `bg-gradient-to-r ${color} text-white scale-105 shadow-lg`
                : hasReactions
                  ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700"
                  : "bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-105
            `}
          >
            <span className={`text-base transition-transform ${isActive ? "animate-bounce" : "group-hover:scale-125"}`}>
              {emoji}
            </span>
            {hasReactions && (
              <span className={`text-xs font-bold ${isActive ? "text-white" : "text-gray-400"}`}>
                {count}
              </span>
            )}
            
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-700 z-10">
              {isActive ? `${label} verdin` : label}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
