"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Scale,
  Target,
  Clock,
  Calendar,
  Salad,
  Dumbbell,
  Heart,
  Image as ImageIcon,
  Tag,
  FolderOpen,
  Rocket,
  TrendingDown,
  Zap,
  CheckCircle2
} from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  color: string
}

type Tag = {
  id: string
  name: string
  slug: string
}

export default function SubmitPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    startWeight: "",
    goalWeight: "",
    durationText: "",
    routine: "",
    diet: "",
    exercise: "",
    motivation: "",
    imageUrl: "",
    categoryId: "",
  })

  // Kategorileri ve etiketleri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags"),
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setTags(tagsData)
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error)
      }
    }

    fetchData()
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-slate-100 to-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-slate-800">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push("/login")
    return null
  }

  const weightLoss = formData.startWeight && formData.goalWeight
    ? parseInt(formData.startWeight) - parseInt(formData.goalWeight)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startWeight: parseInt(formData.startWeight),
          goalWeight: parseInt(formData.goalWeight),
          categoryId: formData.categoryId || null,
          tagIds: selectedTags,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Plan oluşturulurken bir hata oluştu")
        return
      }

      // Başarı mesajını göster
      setSuccess(data.message || "Planınız başarıyla oluşturuldu!")

      // 3 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        router.push(`/profile/${session?.user?.id}`)
      }, 3000)
    } catch (error) {
      setError("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-slate-100 to-zinc-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Mesh Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.2) 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-indigo-200 rounded-full px-6 py-3 mb-4 shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span className="text-slate-700 font-semibold">Başarı Hikayeni Paylaş</span>
            <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 animate-gradient">
            Yeni Plan Oluştur
          </h1>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Başarı hikayeni binlerce kişiye ilham verecek. Planın admin onayından sonra yayınlanacak.
          </p>

          {/* Stats Preview */}
          {weightLoss > 0 && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="bg-white/60 backdrop-blur-xl border border-slate-300/50 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-6 h-6 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-slate-800">-{weightLoss} kg</p>
                    <p className="text-xs text-slate-600">Hedef Kayıp</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl border border-slate-300/50 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-slate-800">{formData.goalWeight || "?"} kg</p>
                    <p className="text-xs text-slate-600">Hedef Kilo</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Form Card */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-3xl blur-xl opacity-10 group-hover:opacity-15 transition-all duration-500" />

          <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-slate-300/50 shadow-lg overflow-hidden">
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/0 to-zinc-50/30" />

            <div className="relative p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50/80 border border-red-300/50 text-red-900 p-5 rounded-2xl flex items-center gap-3 animate-shake">
                    <div className="w-10 h-10 bg-red-200/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="font-semibold">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-50/80 border border-emerald-300/50 text-emerald-900 p-5 rounded-2xl flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-emerald-200/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold">{success}</p>
                      <p className="text-sm text-emerald-700 mt-1">Profilinize yönlendiriliyorsunuz...</p>
                    </div>
                  </div>
                )}

                {/* Title Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span>Başlık</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="relative group/input">
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: 3 Ayda 15 Kilo Verdim - İşte Hikayem"
                      required
                      minLength={8}
                      maxLength={80}
                      className="h-14 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      {formData.title.length}/80
                    </div>
                  </div>
                </div>

                {/* Weight Inputs */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Scale className="w-5 h-5 text-white" />
                      </div>
                      <span>Başlangıç Kilosu</span>
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.startWeight}
                        onChange={(e) => setFormData({ ...formData, startWeight: e.target.value })}
                        placeholder="85"
                        required
                        min={20}
                        max={400}
                        className="h-14 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-semibold">kg</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <span>Hedef Kilo</span>
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.goalWeight}
                        onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                        placeholder="70"
                        required
                        min={20}
                        max={400}
                        className="h-14 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-lg pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">kg</span>
                    </div>
                  </div>
                </div>

                {/* Duration Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span>Süre</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={formData.durationText}
                    onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
                    placeholder="Örn: 90 gün, 3 ay, 12 hafta"
                    required
                    minLength={2}
                    maxLength={32}
                    className="h-14 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-lg"
                  />
                </div>

                {/* Category Select */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
                        <FolderOpen className="w-5 h-5 text-white" />
                      </div>
                      <span>Kategori</span>
                      <span className="text-slate-600 text-sm font-normal">(Opsiyonel)</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full h-14 bg-white/70 border border-slate-300 text-slate-900 rounded-xl px-4 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-lg cursor-pointer"
                    >
                      <option value="">Kategori seçin...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tags Selection */}
                {tags.length > 0 && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <span>Etiketler</span>
                      <span className="text-slate-600 text-sm font-normal">(Opsiyonel)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setSelectedTags((prev) =>
                              prev.includes(tag.id)
                                ? prev.filter((id) => id !== tag.id)
                                : [...prev, tag.id]
                            )
                          }}
                          className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selectedTags.includes(tag.id)
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                            : "bg-white/70 text-slate-700 border border-slate-300 hover:border-pink-400 hover:bg-pink-50/50"
                            }`}
                        >
                          {selectedTags.includes(tag.id) && (
                            <CheckCircle2 className="w-4 h-4 inline-block mr-2" />
                          )}
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Routine Textarea */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span>Günlük Rutin</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    value={formData.routine}
                    onChange={(e) => setFormData({ ...formData, routine: e.target.value })}
                    placeholder="Günlük rutininizi detaylı anlatın... Sabah uyandığınızda neler yapıyorsunuz? Gün içinde nasıl bir program izliyorsunuz?"
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={6}
                    className="bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  />
                  <p className="text-slate-600 text-sm">{formData.routine.length}/3000 karakter</p>
                </div>

                {/* Diet Textarea */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Salad className="w-5 h-5 text-white" />
                    </div>
                    <span>Beslenme Planı</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    value={formData.diet}
                    onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                    placeholder="Beslenme planınızı detaylı anlatın... Kahvaltıda, öğlen ve akşam ne yiyorsunuz? Ara öğünleriniz neler?"
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={6}
                    className="bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                  />
                  <p className="text-slate-600 text-sm">{formData.diet.length}/3000 karakter</p>
                </div>

                {/* Exercise Textarea */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <span>Egzersiz Programı</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    value={formData.exercise}
                    onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                    placeholder="Egzersiz programınızı detaylı anlatın... Hangi egzersizleri yapıyorsunuz? Haftada kaç gün spor yapıyorsunuz?"
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={6}
                    className="bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all resize-none"
                  />
                  <p className="text-slate-600 text-sm">{formData.exercise.length}/3000 karakter</p>
                </div>

                {/* Motivation Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span>Motivasyon Mesajı</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Başkalarına ilham verecek kısa bir motivasyon mesajı..."
                    required
                    minLength={5}
                    maxLength={140}
                    className="h-14 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-lg"
                  />
                  <p className="text-slate-600 text-sm">{formData.motivation.length}/140 karakter</p>
                </div>

                {/* Image URL Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <span>Görsel URL</span>
                    <span className="text-slate-600 text-sm font-normal">(Opsiyonel)</span>
                  </label>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="h-14 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-lg"
                  />
                  <div className="bg-blue-50/70 border border-blue-300/50 rounded-xl p-4">
                    <p className="text-blue-800 text-sm flex items-start gap-2">
                      <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>İpucu: Imgur, Cloudinary veya benzeri bir servise yükleyip URL'sini buraya yapıştırın</span>
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full h-16 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                  >
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient" />

                    {/* Button Content */}
                    <span className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Gönderiliyor...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          <span>Planı Yayınla</span>
                          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </span>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </button>

                  {/* Info Text */}
                  <p className="text-center text-slate-500 mt-4 text-sm">
                    Planınız admin onayından sonra yayınlanacak ve binlerce kişiye ulaşacak 🎉
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>Başarı hikayeniz binlerce kişiye ilham verecek</span>
            <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
