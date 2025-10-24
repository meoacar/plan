"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
  goalWeight?: number | null
  startWeight?: number | null
  city?: string | null
  image?: string | null
  username?: string | null
  _count: {
    plans: number
    comments: number
    likes: number
  }
}

interface AdminUserListProps {
  users: User[]
}

type SortField = "name" | "email" | "createdAt" | "plans" | "activity"
type SortOrder = "asc" | "desc"

export function AdminUserList({ users }: AdminUserListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "USER",
    goalWeight: "",
    startWeight: "",
    city: "",
  })

  // Filtreleme ve sıralama
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter
      return matchesSearch && matchesRole
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "")
          break
        case "email":
          comparison = a.email.localeCompare(b.email)
          break
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "plans":
          comparison = a._count.plans - b._count.plans
          break
        case "activity":
          const aActivity = a._count.plans + a._count.comments + a._count.likes
          const bActivity = b._count.plans + b._count.comments + b._count.likes
          comparison = aActivity - bActivity
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [users, searchTerm, roleFilter, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredAndSortedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredAndSortedUsers.map((u) => u.id)))
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Bu kullanıcının rolünü ${newRole} yapmak istediğinizden emin misiniz?`)) {
      return
    }

    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Rol güncellenemedi")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Bir hata oluştu")
    } finally {
      setLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.refresh()
        setShowDeleteModal(false)
        setUserToDelete(null)
      } else {
        const data = await res.json()
        alert(data.error || "Kullanıcı silinemedi")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Bir hata oluştu")
    } finally {
      setLoading(null)
    }
  }

  const openEditModal = (user: User) => {
    setUserToEdit(user)
    setEditForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
      goalWeight: user.goalWeight?.toString() || "",
      startWeight: user.startWeight?.toString() || "",
      city: user.city || "",
    })
    setShowEditModal(true)
  }

  const updateUser = async () => {
    if (!userToEdit) return

    setLoading(userToEdit.id)
    try {
      const res = await fetch(`/api/admin/users/${userToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name || null,
          email: editForm.email,
          role: editForm.role,
          goalWeight: editForm.goalWeight ? parseInt(editForm.goalWeight) : null,
          startWeight: editForm.startWeight ? parseInt(editForm.startWeight) : null,
          city: editForm.city || null,
        }),
      })

      if (res.ok) {
        router.refresh()
        setShowEditModal(false)
        setUserToEdit(null)
        alert("✓ Kullanıcı güncellendi!")
      } else {
        const data = await res.json()
        alert(data.error || "Kullanıcı güncellenemedi")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Bir hata oluştu")
    } finally {
      setLoading(null)
    }
  }

  const bulkUpdateRole = async (newRole: string) => {
    if (selectedUsers.size === 0) return
    if (!confirm(`${selectedUsers.size} kullanıcının rolünü ${newRole} yapmak istediğinizden emin misiniz?`)) {
      return
    }

    setLoading("bulk")
    try {
      await Promise.all(
        Array.from(selectedUsers).map((userId) =>
          fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
          })
        )
      )
      router.refresh()
      setSelectedUsers(new Set())
    } catch (error) {
      console.error("Error bulk updating:", error)
      alert("Toplu güncelleme sırasında hata oluştu")
    } finally {
      setLoading(null)
    }
  }

  const exportUsers = () => {
    const csv = [
      ["İsim", "Email", "Rol", "Planlar", "Yorumlar", "Beğeniler", "Kayıt Tarihi"],
      ...filteredAndSortedUsers.map((user) => [
        user.name || "Anonim",
        user.email,
        user.role,
        user._count.plans,
        user._count.comments,
        user._count.likes,
        new Date(user.createdAt).toLocaleDateString("tr-TR"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `kullanicilar-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const stats = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      newThisWeek: users.filter((u) => new Date(u.createdAt) > lastWeek).length,
      newThisMonth: users.filter((u) => new Date(u.createdAt) > lastMonth).length,
      activeUsers: users.filter((u) => u._count.plans > 0 || u._count.comments > 0).length,
    }
  }, [users])

  return (
    <div className="space-y-6">
      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
            <div className="text-sm text-blue-700 mt-1">Toplam Kullanıcı</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-900">{stats.admins}</div>
            <div className="text-sm text-purple-700 mt-1">👑 Admin</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-900">{stats.activeUsers}</div>
            <div className="text-sm text-green-700 mt-1">Aktif Kullanıcı</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-orange-900">{stats.newThisWeek}</div>
            <div className="text-sm text-orange-700 mt-1">Bu Hafta</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-pink-900">{stats.newThisMonth}</div>
            <div className="text-sm text-pink-700 mt-1">Bu Ay</div>
          </CardContent>
        </Card>
      </div>

      {/* Arama ve Filtreler */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="🔍 İsim veya email ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "ALL" ? "default" : "outline"}
                onClick={() => setRoleFilter("ALL")}
                className="font-bold"
              >
                Tümü ({users.length})
              </Button>
              <Button
                variant={roleFilter === "USER" ? "default" : "outline"}
                onClick={() => setRoleFilter("USER")}
                className="font-bold"
              >
                👤 User ({users.filter((u) => u.role === "USER").length})
              </Button>
              <Button
                variant={roleFilter === "ADMIN" ? "default" : "outline"}
                onClick={() => setRoleFilter("ADMIN")}
                className="font-bold"
              >
                👑 Admin ({users.filter((u) => u.role === "ADMIN").length})
              </Button>
            </div>
          </div>

          {/* Sıralama */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm font-semibold text-gray-700 self-center">Sırala:</span>
            {[
              { field: "createdAt" as SortField, label: "📅 Tarih" },
              { field: "name" as SortField, label: "👤 İsim" },
              { field: "plans" as SortField, label: "📋 Plan" },
              { field: "activity" as SortField, label: "⚡ Aktivite" },
            ].map(({ field, label }) => (
              <Button
                key={field}
                variant={sortField === field ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort(field)}
                className="text-xs"
              >
                {label} {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
            ))}
          </div>

          {/* Toplu İşlemler */}
          {selectedUsers.size > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-blue-900">
                  {selectedUsers.size} kullanıcı seçildi
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => bulkUpdateRole("ADMIN")}
                    disabled={loading === "bulk"}
                    className="font-bold"
                  >
                    👑 Admin Yap
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkUpdateRole("USER")}
                    disabled={loading === "bulk"}
                    className="font-bold"
                  >
                    👤 User Yap
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUsers(new Set())}
                    className="font-bold"
                  >
                    ✖ İptal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Export */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={exportUsers} className="font-bold">
              📥 CSV İndir ({filteredAndSortedUsers.length} kullanıcı)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Listesi */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
          onChange={toggleSelectAll}
          className="w-5 h-5 cursor-pointer"
        />
        <span className="text-sm font-semibold text-gray-700">
          Tümünü Seç ({filteredAndSortedUsers.length} kullanıcı)
        </span>
      </div>

      <div className="space-y-4">
        {filteredAndSortedUsers.length === 0 ? (
          <Card className="border-2">
            <CardContent className="pt-6 text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-bold text-gray-700">Kullanıcı bulunamadı</p>
              <p className="text-gray-500 mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedUsers.map((user) => (
            <Card
              key={user.id}
              className={`shadow-md hover:shadow-lg transition-all border-2 ${
                selectedUsers.has(user.id) ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-[#2d7a4a] flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/profile/${user.id}`}
                          className="text-xl font-bold hover:text-[#2d7a4a] transition-colors"
                          target="_blank"
                        >
                          {user.name || "Anonim"}
                        </Link>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                        <span className="text-sm font-semibold text-blue-900">
                          📋 {user._count.plans} Plan
                        </span>
                      </div>
                      <div className="bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                        <span className="text-sm font-semibold text-green-900">
                          💬 {user._count.comments} Yorum
                        </span>
                      </div>
                      <div className="bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                        <span className="text-sm font-semibold text-red-900">
                          ❤️ {user._count.likes} Beğeni
                        </span>
                      </div>
                      <div className="bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                        <span className="text-sm font-semibold text-purple-900">
                          ⚡ {user._count.plans + user._count.comments + user._count.likes} Toplam
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      📅 Üyelik: {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div
                      className={`px-4 py-2 rounded-lg font-bold text-center ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-900 border-2 border-purple-300"
                          : "bg-gray-100 text-gray-900 border-2 border-gray-300"
                      }`}
                    >
                      {user.role === "ADMIN" ? "👑 ADMIN" : "👤 USER"}
                    </div>

                    {user.role === "USER" ? (
                      <Button
                        onClick={() => updateUserRole(user.id, "ADMIN")}
                        disabled={loading === user.id}
                        className="font-bold"
                      >
                        {loading === user.id ? "⏳" : "👑 Admin Yap"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => updateUserRole(user.id, "USER")}
                        disabled={loading === user.id}
                        className="font-bold"
                      >
                        {loading === user.id ? "⏳" : "👤 User Yap"}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                      disabled={loading === user.id}
                      className="font-bold"
                    >
                      ✏️ Düzenle
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setUserToDelete(user.id)
                        setShowDeleteModal(true)
                      }}
                      disabled={loading === user.id}
                      className="font-bold"
                    >
                      🗑️ Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Düzenleme Modal */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-6">✏️ Kullanıcıyı Düzenle</h3>
              
              <div className="space-y-4">
                {/* İsim */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👤 İsim
                  </label>
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Kullanıcı adı"
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email
                  </label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👑 Rol
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="USER">👤 USER</option>
                    <option value="ADMIN">👑 ADMIN</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Başlangıç Kilosu */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⚖️ Başlangıç Kilosu (kg)
                    </label>
                    <Input
                      type="number"
                      value={editForm.startWeight}
                      onChange={(e) => setEditForm({ ...editForm, startWeight: e.target.value })}
                      placeholder="Örn: 85"
                      className="w-full"
                    />
                  </div>

                  {/* Hedef Kilo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎯 Hedef Kilo (kg)
                    </label>
                    <Input
                      type="number"
                      value={editForm.goalWeight}
                      onChange={(e) => setEditForm({ ...editForm, goalWeight: e.target.value })}
                      placeholder="Örn: 70"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Şehir */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 Şehir
                  </label>
                  <Input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="Örn: İstanbul"
                    className="w-full"
                  />
                </div>

                {/* Kullanıcı Bilgileri */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-700 mb-2">📊 Kullanıcı İstatistikleri</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Username:</span>{" "}
                      <span className="font-semibold">{userToEdit.username || "Yok"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profil Resmi:</span>{" "}
                      <span className="font-semibold">{userToEdit.image ? "✓ Var" : "✗ Yok"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Planlar:</span>{" "}
                      <span className="font-semibold">{userToEdit._count.plans}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Yorumlar:</span>{" "}
                      <span className="font-semibold">{userToEdit._count.comments}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Beğeniler:</span>{" "}
                      <span className="font-semibold">{userToEdit._count.likes}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Üyelik:</span>{" "}
                      <span className="font-semibold">
                        {new Date(userToEdit.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={updateUser}
                  disabled={loading === userToEdit.id}
                  className="flex-1 font-bold"
                >
                  {loading === userToEdit.id ? "⏳ Kaydediliyor..." : "💾 Kaydet"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setUserToEdit(null)
                  }}
                  className="flex-1 font-bold"
                >
                  ✖ İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Silme Onay Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">⚠️ Kullanıcıyı Sil</h3>
              <p className="text-gray-700 mb-6">
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve
                kullanıcının tüm planları, yorumları ve beğenileri de silinecektir.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(userToDelete)}
                  disabled={loading === userToDelete}
                  className="flex-1 font-bold"
                >
                  {loading === userToDelete ? "⏳ Siliniyor..." : "🗑️ Evet, Sil"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                  }}
                  className="flex-1 font-bold"
                >
                  ✖ İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
