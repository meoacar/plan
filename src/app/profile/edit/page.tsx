"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileCompletionCard } from "@/components/profile-completion-card"
import { BadgeNotification } from "@/components/badge-notification"

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [newBadge, setNewBadge] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
    city: "",
    startWeight: "",
    goalWeight: "",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    website: "",
  })

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const avatars = [
    "/avatars/1.png",
    "/avatars/2.png",
    "/avatars/3.png",
    "/avatars/4.png",
    "/avatars/5.png",
    "/avatars/6.png",
    "/avatars/7.png",
  ]

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          image: data.image || "",
          city: data.city || "",
          startWeight: data.startWeight?.toString() || "",
          goalWeight: data.goalWeight?.toString() || "",
          instagram: data.instagram || "",
          twitter: data.twitter || "",
          youtube: data.youtube || "",
          tiktok: data.tiktok || "",
          website: data.website || "",
        })
        setHasPassword(data.hasPassword || false)

        // Mevcut resmi göster
        if (data.image) {
          if (data.image.startsWith("/avatars/")) {
            setSelectedAvatar(data.image)
          } else {
            setUploadedImage(data.image)
          }
        }
      }
    } catch (error) {
      console.error("Profil yüklenemedi:", error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Dosya boyutu 2MB'dan küçük olmalıdır")
      return
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      setError("Sadece resim dosyaları yüklenebilir")
      return
    }

    setImageLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Resim yüklenemedi")
        return
      }

      setUploadedImage(data.url)
      setSelectedAvatar(null)
      setFormData(prev => ({ ...prev, image: data.url }))
    } catch (error) {
      setError("Resim yüklenirken bir hata oluştu")
    } finally {
      setImageLoading(false)
    }
  }

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar)
    setUploadedImage(null)
    setFormData(prev => ({ ...prev, image: avatar }))
    setShowAvatarPicker(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          image: uploadedImage || selectedAvatar || null,
          city: formData.city || null,
          startWeight: formData.startWeight ? parseInt(formData.startWeight) : null,
          goalWeight: formData.goalWeight ? parseInt(formData.goalWeight) : null,
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          youtube: formData.youtube || null,
          tiktok: formData.tiktok || null,
          website: formData.website || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Profil güncellenemedi")
        return
      }

      // Profil tamamlama kontrolü
      if (data.profileCompletion?.newBadge) {
        setNewBadge(data.profileCompletion.newBadge.badge)
        setSuccess(`🎉 Tebrikler! Profilini %100 tamamladın ve "${data.profileCompletion.newBadge.badge.name}" rozetini kazandın!`)
      } else if (data.profileCompletion?.completed) {
        setSuccess("✅ Profil başarıyla güncellendi! Profilin %100 tamamlandı! 🎉")
      } else {
        setSuccess(`✅ Profil başarıyla güncellendi! (Tamamlanma: %${data.profileCompletion?.percentage || 0})`)
      }
    } catch (error) {
      setError("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Yeni şifreler eşleşmiyor")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Yeni şifre en az 6 karakter olmalıdır")
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPasswordError(data.error || "Şifre değiştirilemedi")
        return
      }

      setPasswordSuccess("✅ Şifre başarıyla değiştirildi!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setPasswordError("Bir hata oluştu")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)

    try {
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Hesap silinemedi")
        setDeleteLoading(false)
        return
      }

      await signOut({ callbackUrl: "/" })
    } catch (error) {
      setError("Bir hata oluştu")
      setDeleteLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">⏳ Yükleniyor...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Badge Notification */}
      {newBadge && (
        <BadgeNotification 
          badge={newBadge} 
          onClose={() => setNewBadge(null)} 
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">⚙️ Profil Ayarları</h1>
        <p className="text-gray-600">Profil bilgilerinizi güncelleyin ve hesabınızı yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profil Tamamlama */}
          <ProfileCompletionCard 
            fields={[
              { name: 'name', label: 'İsim Soyisim', completed: !!formData.name },
              { name: 'bio', label: 'Hakkında', completed: !!formData.bio },
              { name: 'image', label: 'Profil Resmi', completed: !!(uploadedImage || selectedAvatar) },
              { name: 'city', label: 'Şehir', completed: !!formData.city },
              { name: 'startWeight', label: 'Başlangıç Kilosu', completed: !!formData.startWeight },
              { name: 'goalWeight', label: 'Hedef Kilo', completed: !!formData.goalWeight },
              { name: 'social', label: 'Sosyal Medya', completed: !!(formData.instagram || formData.twitter || formData.youtube || formData.tiktok || formData.website) },
            ]}
          />

          <Card className="shadow-lg sticky top-4">
            <CardContent className="p-4">
              <nav className="space-y-2">
                <a href="#profil" className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                  <span className="text-xl">👤</span>
                  Profil Bilgileri
                </a>
                {hasPassword && (
                  <a href="#sifre" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                    <span className="text-xl">🔒</span>
                    Şifre Değiştir
                  </a>
                )}
                <a href="#tehlike" className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 font-medium transition-colors">
                  <span className="text-xl">⚠️</span>
                  Hesap Yönetimi
                </a>
              </nav>

              <div className="mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full font-semibold"
                  onClick={() => router.push(`/profile/${session?.user?.id}`)}
                >
                  ← Profile Dön
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profil Bilgileri */}
          <Card id="profil" className="shadow-lg scroll-mt-4">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Profil Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <p className="text-green-800 font-medium">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* Profil Resmi */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                      <span>🖼️</span>
                      Profil Resmi
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Mevcut Resim */}
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                          {uploadedImage || selectedAvatar ? (
                            <img
                              src={uploadedImage || selectedAvatar || ""}
                              alt="Profil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">👤</span>
                          )}
                        </div>
                        {imageLoading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <span className="text-2xl animate-spin">⏳</span>
                          </div>
                        )}
                      </div>

                      {/* Butonlar */}
                      <div className="flex-1 space-y-3 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <label className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={imageLoading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full font-semibold"
                              disabled={imageLoading}
                              onClick={(e) => {
                                e.preventDefault()
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                input?.click()
                              }}
                            >
                              <span className="mr-2">📤</span>
                              Resim Yükle
                            </Button>
                          </label>

                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 font-semibold"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          >
                            <span className="mr-2">🎨</span>
                            Avatar Seç
                          </Button>
                        </div>

                        {(uploadedImage || selectedAvatar) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setUploadedImage(null)
                              setSelectedAvatar(null)
                              setFormData(prev => ({ ...prev, image: "" }))
                            }}
                          >
                            <span className="mr-2">🗑️</span>
                            Resmi Kaldır
                          </Button>
                        )}

                        <p className="text-xs text-gray-500">
                          Max 2MB, JPG, PNG veya GIF formatında
                        </p>
                      </div>
                    </div>

                    {/* Avatar Seçici */}
                    {showAvatarPicker && (
                      <div className="mt-4 p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50">
                        <p className="text-sm font-semibold mb-3 text-gray-700">Bir avatar seçin:</p>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                          {avatars.map((avatar, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAvatarSelect(avatar)}
                              className={`w-full aspect-square rounded-full overflow-hidden border-3 transition-all hover:scale-110 ${selectedAvatar === avatar
                                ? "border-emerald-500 ring-4 ring-emerald-200"
                                : "border-gray-300 hover:border-emerald-400"
                                }`}
                            >
                              <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Temel Bilgiler */}
                <div className="space-y-4 pt-6 border-t">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>📧</span>
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50 cursor-not-allowed border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">Email adresi değiştirilemez</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>👤</span>
                      İsim Soyisim
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Adınız Soyadınız"
                      required
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>📝</span>
                      Hakkında
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Kendiniz hakkında birkaç şey yazın..."
                      rows={4}
                      className="resize-none border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">Profilinizde görünecek kısa bir açıklama</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>📍</span>
                      Şehir
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="örn: İstanbul, Ankara, İzmir"
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">Türkiye Kilo Haritası için kullanılacak</p>
                  </div>
                </div>

                {/* Hedefler */}
                <div className="pt-6 border-t">
                  <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    Kilo Hedefleri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Başlangıç Kilosu (kg)
                      </label>
                      <Input
                        type="number"
                        value={formData.startWeight}
                        onChange={(e) => setFormData({ ...formData, startWeight: e.target.value })}
                        placeholder="örn: 85"
                        min="30"
                        max="300"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Hedef Kilo (kg)
                      </label>
                      <Input
                        type="number"
                        value={formData.goalWeight}
                        onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                        placeholder="örn: 70"
                        min="30"
                        max="300"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sosyal Medya */}
                <div className="pt-6 border-t">
                  <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🌐</span>
                    Sosyal Medya Hesapları
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        <span>📷</span>
                        Instagram
                      </label>
                      <Input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        placeholder="@kullaniciadi veya instagram.com/kullaniciadi"
                        className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        <span>🐦</span>
                        Twitter/X
                      </label>
                      <Input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        placeholder="@kullaniciadi veya twitter.com/kullaniciadi"
                        className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        <span>📺</span>
                        YouTube
                      </label>
                      <Input
                        type="text"
                        value={formData.youtube}
                        onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                        placeholder="youtube.com/@kullaniciadi"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        <span>🎵</span>
                        TikTok
                      </label>
                      <Input
                        type="text"
                        value={formData.tiktok}
                        onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                        placeholder="@kullaniciadi veya tiktok.com/@kullaniciadi"
                        className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        <span>🌍</span>
                        Website
                      </label>
                      <Input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://websitesi.com"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💾</span>
                        Değişiklikleri Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Şifre Değiştirme */}
          {hasPassword && (
            <Card id="sifre" className="shadow-lg scroll-mt-4">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  Şifre Değiştir
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {passwordSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
                      <span className="text-2xl">✅</span>
                      <p className="text-green-800 font-medium">{passwordSuccess}</p>
                    </div>
                  )}

                  {passwordError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <p className="text-red-800 font-medium">{passwordError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>🔑</span>
                      Mevcut Şifre
                    </label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Mevcut şifreniz"
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>🆕</span>
                      Yeni Şifre
                    </label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="En az 6 karakter"
                      required
                      minLength={6}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>✅</span>
                      Yeni Şifre (Tekrar)
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Yeni şifrenizi tekrar girin"
                      required
                      minLength={6}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Değiştiriliyor...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🔒</span>
                        Şifreyi Değiştir
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {!hasPassword && (
            <Card id="sifre" className="shadow-lg border-blue-200 scroll-mt-4">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🌐</div>
                  <p className="text-gray-700 font-medium">
                    Google ile giriş yaptığınız için şifre değiştirme özelliği kullanılamaz.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hesap Silme */}
          <Card id="tehlike" className="shadow-lg border-2 border-red-200 scroll-mt-4">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-red-700">
                <span className="text-2xl">⚠️</span>
                Tehlikeli Bölge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    Hesabınızı Silmek İstediğinizden Emin misiniz?
                  </p>
                  <p className="text-red-700 text-sm ml-7">
                    Bu işlem geri alınamaz. Tüm planlarınız, yorumlarınız ve beğenileriniz kalıcı olarak silinecektir.
                  </p>
                </div>

                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <span className="mr-2">🗑️</span>
                    Hesabı Sil
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                      <p className="text-center font-bold text-yellow-800">
                        Son kez soruyoruz: Bu işlem geri alınamaz!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 text-base font-semibold"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteLoading}
                      >
                        <span className="mr-2">❌</span>
                        İptal
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-12 text-base font-semibold"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Siliniyor...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">✅</span>
                            Evet, Sil
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
