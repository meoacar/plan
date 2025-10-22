"use client"

import { useState } from "react"

interface BannedWord {
  id: string
  word: string
  createdAt: string
  creator: {
    id: string
    name: string | null
    email: string
  }
}

interface BlockedPlan {
  id: string
  title: string
  slug: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  category: {
    id: string
    name: string
    color: string
  } | null
  _count: {
    comments: number
    likes: number
  }
}

interface ModerationPanelProps {
  initialBannedWords: BannedWord[]
  initialBlockedContent: {
    blockedPlans: BlockedPlan[]
    totalPlans: number
  }
  stats: {
    totalBannedWords: number
    blockedPlans: number
    blockedComments: number
  }
}

export function ModerationPanel({
  initialBannedWords,
  initialBlockedContent,
  stats,
}: ModerationPanelProps) {
  const [bannedWords, setBannedWords] = useState<BannedWord[]>(initialBannedWords)
  const [blockedPlans, setBlockedPlans] = useState<BlockedPlan[]>(
    initialBlockedContent.blockedPlans
  )
  const [newWord, setNewWord] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/admin/moderation/banned-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: newWord.trim().toLowerCase() }),
      })

      if (response.ok) {
        const { bannedWord } = await response.json()
        setBannedWords([bannedWord, ...bannedWords])
        setNewWord("")
        alert("Yasaklı kelime eklendi")
      } else {
        const { error } = await response.json()
        alert(error || "Kelime eklenirken hata oluştu")
      }
    } catch {
      alert("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWord = async (id: string, word: string) => {
    if (!confirm(`"${word}" kelimesini yasaklı listeden çıkarmak istediğinize emin misiniz?`)) {
      return
    }

    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/admin/moderation/banned-words/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBannedWords(bannedWords.filter((w) => w.id !== id))
        alert("Yasaklı kelime silindi")
      } else {
        const { error } = await response.json()
        alert(error || "Kelime silinirken hata oluştu")
      }
    } catch {
      alert("Bir hata oluştu")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleApprovePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/admin/plans/${planId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        setBlockedPlans(blockedPlans.filter((p) => p.id !== planId))
        alert("Plan onaylandı")
      } else {
        const { error } = await response.json()
        alert(error || "Plan onaylanırken hata oluştu")
      }
    } catch {
      alert("Bir hata oluştu")
    }
  }

  const handleRejectPlan = async (planId: string) => {
    const reason = prompt("Lütfen ret sebebini girin (minimum 10 karakter):")
    
    if (!reason) {
      return
    }

    if (reason.trim().length < 10) {
      alert("Ret sebebi en az 10 karakter olmalıdır")
      return
    }

    try {
      const response = await fetch(`/api/admin/plans/${planId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      })

      if (response.ok) {
        setBlockedPlans(blockedPlans.filter((p) => p.id !== planId))
        alert("Plan reddedildi")
      } else {
        const { error } = await response.json()
        alert(error || "Plan reddedilirken hata oluştu")
      }
    } catch {
      alert("Bir hata oluştu")
    }
  }

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yasaklı Kelimeler</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalBannedWords}
              </p>
            </div>
            <div className="text-4xl">🚫</div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bekleyen Planlar</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.blockedPlans}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engellenen Yorumlar</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.blockedComments}
              </p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>
      </div>

      {/* Yasaklı Kelimeler */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Yasaklı Kelimeler</h3>

        <form onSubmit={handleAddWord} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Yeni yasaklı kelime ekle..."
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newWord.trim()}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Ekleniyor..." : "Ekle"}
          </button>
        </form>

        <div className="space-y-2">
          {bannedWords.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Henüz yasaklı kelime yok</p>
          ) : (
            bannedWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {word.word}
                  </span>
                  <span className="text-xs text-gray-500">
                    Ekleyen: {word.creator.name || word.creator.email}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteWord(word.id, word.word)}
                  disabled={deleteLoading === word.id}
                  className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deleteLoading === word.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Engellenen İçerik */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Bekleyen Planlar ({blockedPlans.length})
        </h3>

        <div className="space-y-4">
          {blockedPlans.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Onay bekleyen plan bulunmuyor
            </p>
          ) : (
            blockedPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-md border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                      <span>👤 {plan.user.name || plan.user.email}</span>
                      {plan.category && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: plan.category.color }}
                        >
                          {plan.category.name}
                        </span>
                      )}
                      <span>💬 {plan._count.comments}</span>
                      <span>❤️ {plan._count.likes}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovePlan(plan.id)}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    ✓ Onayla
                  </button>
                  <button
                    onClick={() => handleRejectPlan(plan.id)}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    ✗ Reddet
                  </button>
                  <a
                    href={`/plan/${plan.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    👁️ Görüntüle
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
