"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Sparkles, 
  Scale, 
  Target, 
  Clock, 
  Salad, 
  Dumbbell, 
  Heart, 
  Image as ImageIcon, 
  Tag, 
  FolderOpen,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Upload,
  X
} from "lucide-react"

type Category = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
  slug: string
}

type Plan = {
  id: string
  title: string
  slug: string
  startWeight: number
  goalWeight: number
  durationText: string
  routine: string
  diet: string
  exercise: string
  motivation: string
  imageUrl: string | null
  status: string
  rejectionReason: string | null
  categoryId: string | null
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
}

interface PlanEditFormProps {
  plan: Plan
  categories: Category[]
  tags: Tag[]
}

export function PlanEditForm({ plan, categories, tags }: PlanEditFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>(
    plan.tags.map(pt => pt.tag.id)
  )
  const [formData, setFormData] = useState({
    title: plan.title,
    startWeight: plan.startWeight.toString(),
    goalWeight: plan.goalWeight.toString(),
    durationText: plan.durationText,
    routine: plan.routine,
    diet: plan.diet,
    exercise: plan.exercise,
    motivation: plan.motivation,
    imageUrl: plan.imageUrl || "",
    categoryId: plan.categoryId || "",
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload/plan", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Resim yüklenirken bir hata oluştu")
        return
      }

      setFormData(prev => ({ ...prev, imageUrl: data.url }))
    } catch (error) {
      setError("Resim yüklenirken bir hata oluştu")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
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
        setError(data.error || "Plan güncellenirken bir hata oluştu")
        return
      }

      alert("Planınız güncellendi ve tekrar onaya gönderildi!")
      router.push(`/plan/${data.plan.slug}`)
    } catch (error) {
      setError("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const isRejected = plan.status === "REJECTED"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <div className="text-center mb-12 space-y-6">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            Planı Düzenle
          </h1>
          
          {isRejected && plan.rejectionReason && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-red-300 mb-2">Planınız Reddedildi</h3>
                  <p className="text-gray-300 leading-relaxed mb-3">{plan.rejectionReason}</p>
                  <p className="text-sm text-gray-400">
                    💡 Gerekli düzeltmeleri yapıp tekrar onaya gönderebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
          
          <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="relative p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-red-500/50 text-white p-5 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <p className="font-semibold">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-bold text-lg">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <span>Başlık</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    minLength={8}
                    maxLength={80}
                    className="h-14 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-white font-bold text-lg">
                      <Scale className="w-6 h-6 text-blue-400" />
                      <span>Başlangıç Kilosu</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.startWeight}
                      onChange={(e) => setFormData({ ...formData, startWeight: e.target.value })}
                      required
                      min={20}
                      max={400}
                      className="h-14 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-white font-bold text-lg">
                      <Target className="w-6 h-6 text-green-400" />
                      <span>Hedef Kilo</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.goalWeight}
                      onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                      required
                      min={20}
                      max={400}
                      className="h-14 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-bold text-lg">
                    <Clock className="w-6 h-6 text-orange-400" />
                    <span>Süre</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.durationText}
                    onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
                    required
                    minLength={2}
                    maxLength={32}
                    className="h-14 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                {categories.length > 0 && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-white font-bold text-lg">
                      <FolderOpen className="w-6 h-6 text-yellow-400" />
                      <span>Kategori</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full h-14 bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4"
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

                {tags.length > 0 && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-white font-bold text-lg">
                      <Tag className="w-6 h-6 text-pink-400" />
                      <span>Etiketler</span>
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
                          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                            selectedTags.includes(tag.id)
                              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                              : "bg-gray-800/50 text-gray-300 border border-gray-700"
                          }`}
                        >
                          {selectedTags.includes(tag.id) && <CheckCircle2 className="w-4 h-4 inline-block mr-2" />}
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-bold text-lg">
                    <Clock className="w-6 h-6 text-indigo-400" />
                    <span>Günlük Rutin</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    value={formData.routine}
                    onChange={(e) => setFormData({ ...formData, routine: e.target.value })}
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={6}
                    className="bg-gray-800/50 border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-bold text-lg">
                    <Salad className="w-6 h-6 text-green-400" />
                    <span>Beslenme Planı</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    value={formData.diet}
                    onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={6}
                    className="bg-gray-800/50 border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-bold text-lg">
                    <Dumbbell className="w-6 h-6 text-red-400" />
                    <span>Egzersiz Programı</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    value={formData.exercise}
                    onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                    required
                    minLength={30}
                    maxLength={3000}
                    rows={6}
                    className="bg-gray-800/50 border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-bold text-lg">
                    <Heart className="w-6 h-6 text-pink-400" />
                    <span>Motivasyon Mesajı</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    required
                    minLength={5}
                    maxLength={140}
                    className="h-14 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-bold text-lg">
                    <ImageIcon className="w-6 h-6 text-cyan-400" />
                    <span>Görsel (Opsiyonel)</span>
                  </label>
                  
                  <div className="space-y-4">
                    {/* Dosya Yükleme */}
                    <div className="flex gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="plan-image-upload"
                      />
                      <label
                        htmlFor="plan-image-upload"
                        className={`flex-1 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-3 cursor-pointer hover:from-cyan-500 hover:to-blue-500 transition-all ${
                          uploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {uploading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Bilgisayardan Yükle
                          </>
                        )}
                      </label>
                    </div>

                    {/* URL Girişi */}
                    <div className="relative">
                      <Input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="veya görsel URL'si girin..."
                        className="h-14 bg-gray-800/50 border-gray-700 text-white pr-12"
                      />
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Görsel Önizleme */}
                    {formData.imageUrl && (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-700">
                        <Image
                          src={formData.imageUrl}
                          alt="Plan görseli önizleme"
                          fill
                          className="object-cover"
                          onError={() => {
                            setError("Görsel yüklenemedi. Lütfen geçerli bir URL girin.")
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Güncelleniyor...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Rocket className="w-6 h-6" />
                        Güncelle ve Onaya Gönder
                      </span>
                    )}
                  </button>
                  <Link href={`/plan/${plan.slug}`}>
                    <button
                      type="button"
                      className="px-8 h-16 bg-gray-700 text-white rounded-2xl font-bold text-xl hover:bg-gray-600 transition-all"
                    >
                      İptal
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
