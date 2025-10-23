"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { ShoppingCart, Plus, Trash2, Check, X } from "lucide-react"

interface ShoppingListItem {
  id: string
  category: string
  name: string
  quantity: string
  isChecked: boolean
  note?: string
  estimatedPrice?: number
}

interface ShoppingListProps {
  planId?: string
  planTitle?: string
  dietContent?: string
}

const CATEGORIES = [
  { value: "Protein", label: "🥩 Protein", color: "from-red-500 to-pink-500" },
  { value: "Sebze", label: "🥬 Sebze", color: "from-green-500 to-emerald-500" },
  { value: "Meyve", label: "🍎 Meyve", color: "from-yellow-500 to-orange-500" },
  { value: "Tahıl", label: "🌾 Tahıl", color: "from-amber-500 to-yellow-500" },
  { value: "Süt Ürünleri", label: "🥛 Süt Ürünleri", color: "from-blue-500 to-cyan-500" },
  { value: "İçecek", label: "💧 İçecek", color: "from-cyan-500 to-blue-500" },
  { value: "Diğer", label: "📦 Diğer", color: "from-gray-500 to-gray-600" }
]

export function ShoppingList({ planId, planTitle, dietContent }: ShoppingListProps) {
  const { data: session } = useSession()
  const [lists, setLists] = useState<any[]>([])
  const [currentList, setCurrentList] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newListName, setNewListName] = useState("")

  useEffect(() => {
    if (session) {
      loadLists()
    }
  }, [session])

  const loadLists = async () => {
    try {
      const url = planId 
        ? `/api/shopping-lists?planId=${planId}` 
        : `/api/shopping-lists`
      const res = await fetch(url)
      const data = await res.json()
      setLists(data.lists || [])
      if (data.lists?.length > 0) {
        setCurrentList(data.lists[0])
      }
    } catch (error) {
      console.error("Liste yükleme hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSmartList = async () => {
    if (!dietContent) {
      alert("Bu plan için beslenme bilgisi bulunamadı")
      return
    }

    setGenerating(true)
    try {
      const res = await fetch("/api/shopping-lists/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          planTitle,
          dietContent
        })
      })

      const data = await res.json()
      if (res.ok) {
        setLists([data.list, ...lists])
        setCurrentList(data.list)
        setShowCreateForm(false)
      } else {
        alert(data.error || "Liste oluşturulamadı")
      }
    } catch (error) {
      console.error("Liste oluşturma hatası:", error)
      alert("Bir hata oluştu")
    } finally {
      setGenerating(false)
    }
  }

  const createEmptyList = async () => {
    if (!newListName.trim()) {
      alert("Liste adı gerekli")
      return
    }

    try {
      const res = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName,
          planId
        })
      })

      const data = await res.json()
      if (res.ok) {
        setLists([data.list, ...lists])
        setCurrentList(data.list)
        setNewListName("")
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error("Liste oluşturma hatası:", error)
    }
  }

  const toggleItem = async (itemId: string, isChecked: boolean) => {
    try {
      await fetch(`/api/shopping-lists/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked: !isChecked })
      })

      setCurrentList({
        ...currentList,
        items: currentList.items.map((item: any) =>
          item.id === itemId ? { ...item, isChecked: !isChecked } : item
        )
      })
    } catch (error) {
      console.error("Öğe güncelleme hatası:", error)
    }
  }

  const deleteList = async (listId: string) => {
    if (!confirm("Bu listeyi silmek istediğinizden emin misiniz?")) return

    try {
      await fetch(`/api/shopping-lists/${listId}`, { method: "DELETE" })
      setLists(lists.filter(l => l.id !== listId))
      if (currentList?.id === listId) {
        setCurrentList(lists[0] || null)
      }
    } catch (error) {
      console.error("Liste silme hatası:", error)
    }
  }

  if (!session) {
    return (
      <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30">
        <CardContent className="pt-6 text-center py-8">
          <ShoppingCart className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-white mb-2">
            Alışveriş listesi oluşturmak için giriş yapın
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10">
        <CardContent className="pt-6 text-center py-12">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white">Alışveriş Listesi</h3>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Liste
          </Button>
        </div>
        
        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xl">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-blue-200 text-sm leading-relaxed">
                <span className="font-bold">Bu plana özel alışveriş listesi oluşturun!</span> Akıllı liste özelliği, yukarıdaki beslenme programını analiz ederek ihtiyacınız olan malzemeleri otomatik olarak belirler ve kategorilere ayırır. Markete gitmeden önce listenizi hazırlayın ve hiçbir şeyi unutmayın.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10">
          <CardContent className="pt-6 space-y-4">
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Liste adı (örn: Haftalık Alışveriş)"
              className="bg-gray-800/50 border-gray-700 text-white"
            />
            
            {dietContent && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-purple-200 text-xs leading-relaxed">
                  <span className="font-bold">🤖 Akıllı Liste:</span> Beslenme programınızdaki yiyecekleri otomatik tespit eder (tavuk, yumurta, brokoli vb.) ve kategorilere ayırarak alışveriş listenizi hazırlar.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              {dietContent && (
                <Button
                  onClick={generateSmartList}
                  disabled={generating}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Oluşturuluyor...
                    </span>
                  ) : (
                    "🤖 Akıllı Liste Oluştur"
                  )}
                </Button>
              )}
              <Button
                onClick={createEmptyList}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                📝 Boş Liste Oluştur
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lists Tabs */}
      {lists.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setCurrentList(list)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                currentList?.id === list.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {list.name}
            </button>
          ))}
        </div>
      )}

      {/* Current List */}
      {currentList ? (
        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white">{currentList.name}</CardTitle>
              <Button
                onClick={() => deleteList(currentList.id)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {currentList.description && (
              <p className="text-gray-400 text-sm">{currentList.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {CATEGORIES.map((category) => {
              const categoryItems = currentList.items?.filter(
                (item: any) => item.category === category.value
              ) || []

              if (categoryItems.length === 0) return null

              return (
                <div key={category.value} className="space-y-2">
                  <h4 className={`font-bold text-lg bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.label}
                  </h4>
                  <div className="space-y-2">
                    {categoryItems.map((item: any) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          item.isChecked
                            ? "bg-gray-800/30 border-gray-700 opacity-60"
                            : "bg-gray-800/50 border-gray-700 hover:border-green-500/50"
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(item.id, item.isChecked)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            item.isChecked
                              ? "bg-green-500 border-green-500"
                              : "border-gray-600 hover:border-green-500"
                          }`}
                        >
                          {item.isChecked && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-semibold ${item.isChecked ? "line-through text-gray-500" : "text-white"}`}>
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-400">{item.quantity}</p>
                          {item.note && (
                            <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                          )}
                        </div>
                        {item.estimatedPrice && (
                          <span className="text-green-400 font-bold">
                            ₺{item.estimatedPrice}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {(!currentList.items || currentList.items.length === 0) && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Liste boş</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10">
          <CardContent className="pt-6 text-center py-12">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <p className="text-xl font-bold text-white mb-2">
                Henüz alışveriş listesi yok
              </p>
              <p className="text-gray-400 mb-4">
                Bu plana özel alışveriş listesi oluşturun
              </p>
              
              {/* Feature highlights */}
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-300 mb-3 font-semibold">Akıllı liste ile:</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Beslenme programınızdaki tüm malzemeler otomatik tespit edilir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Kategorilere göre düzenlenir (Protein, Sebze, Meyve vb.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Önerilen miktarlar belirtilir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Markette kolayca takip edebilirsiniz</span>
                  </li>
                </ul>
              </div>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                İlk Listeni Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
