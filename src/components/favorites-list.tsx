"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Heart, Eye, MessageCircle, Trash2, Edit2, Save, X } from "lucide-react"

interface FavoritesListProps {
  initialFavorites?: any[]
}

export function FavoritesList({ initialFavorites = [] }: FavoritesListProps) {
  const [favorites, setFavorites] = useState(initialFavorites)
  const [loading, setLoading] = useState(initialFavorites.length === 0)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  useEffect(() => {
    if (initialFavorites.length === 0) {
      fetchFavorites()
    }
  }, [])

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Fetch favorites error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!confirm("Bu planı favorilerden çıkarmak istediğinize emin misiniz?")) {
      return
    }

    try {
      const res = await fetch(`/api/favorites/${favoriteId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setFavorites(favorites.filter((f) => f.id !== favoriteId))
      } else {
        const data = await res.json()
        alert(data.error || "Bir hata oluştu")
      }
    } catch (error) {
      console.error("Remove favorite error:", error)
      alert("Bir hata oluştu")
    }
  }

  const handleEditNote = (favoriteId: string, currentNote: string | null) => {
    setEditingNote(favoriteId)
    setNoteText(currentNote || "")
  }

  const handleSaveNote = async (favoriteId: string) => {
    try {
      const res = await fetch(`/api/favorites/${favoriteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText }),
      })

      if (res.ok) {
        const data = await res.json()
        setFavorites(
          favorites.map((f) =>
            f.id === favoriteId ? { ...f, note: data.favorite.note } : f
          )
        )
        setEditingNote(null)
        setNoteText("")
      } else {
        const data = await res.json()
        alert(data.error || "Bir hata oluştu")
      }
    } catch (error) {
      console.error("Save note error:", error)
      alert("Bir hata oluştu")
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setNoteText("")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-20">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Favoriler yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  if (favorites.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
        <CardContent className="pt-6 text-center py-20">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">⭐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Henüz favori planınız yok
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Beğendiğiniz planları favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg px-8 py-6 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
              Planları Keşfet
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {favorites.map((favorite) => {
        const plan = favorite.plan
        const weightLoss = plan.startWeight - plan.goalWeight
        const isEditing = editingNote === favorite.id

        return (
          <div key={favorite.id} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
            
            <Card className="relative bg-white border border-gray-200 hover:border-yellow-500/50 transition-all shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <Link 
                    href={`/plan/${plan.slug}`}
                    className="flex-1 group/link"
                  >
                    <h3 className="text-2xl font-bold text-white group-hover/link:text-yellow-400 transition-colors mb-2">
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        👤 {plan.user.name || "Anonim"}
                      </span>
                      <span>•</span>
                      <span>
                        📅 {new Date(favorite.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </Link>

                  <Button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg">
                    -{weightLoss}kg
                  </div>
                  <div className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl font-semibold border border-gray-600">
                    {plan.durationText}
                  </div>
                  {plan.category && (
                    <div className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl font-semibold border border-purple-500/30">
                      {plan.category.name}
                    </div>
                  )}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    {plan._count.likes}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    {plan.views}
                  </span>
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                    {plan._count.comments}
                  </span>
                </div>

                {/* Note Section */}
                <div className="pt-4 border-t border-gray-700">
                  {isEditing ? (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <span>📝</span>
                        Notunuz
                      </label>
                      <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Bu plan hakkında notlarınızı ekleyin..."
                        rows={3}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveNote(favorite.id)}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Kaydet
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4 mr-2" />
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <span>📝</span>
                          Notunuz
                        </label>
                        <Button
                          onClick={() => handleEditNote(favorite.id, favorite.note)}
                          size="sm"
                          variant="ghost"
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Düzenle
                        </Button>
                      </div>
                      {favorite.note ? (
                        <p className="text-gray-300 bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                          {favorite.note}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          Not eklenmemiş
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
