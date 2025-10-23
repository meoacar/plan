"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Heart, Eye, MessageCircle } from "lucide-react"
import { ShareButtons } from "./share-buttons"
import { FavoriteButton } from "./favorite-button"
import { AddToCollectionButton } from "./add-to-collection-button"
import { PdfExportButton } from "./pdf-export-button"
import { VideoEmbed } from "./video-embed"
import { CommentReactions } from "./comment-reactions"
import { ShoppingList } from "./shopping-list"

interface PlanDetailProps {
  plan: any
  similarPlans?: any[]
}

export function PlanDetail({ plan, similarPlans = [] }: PlanDetailProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(plan.isLiked || false)
  const [likeCount, setLikeCount] = useState(plan._count.likes)

  console.log('Plan loaded:', {
    isLiked: plan.isLiked,
    likeCount: plan._count.likes,
    likes: plan.likes
  })
  const [comments, setComments] = useState(plan.comments)
  const [commentBody, setCommentBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const isAdmin = session?.user?.role === "ADMIN"
  const isPending = plan.status === "PENDING"
  const isRejected = plan.status === "REJECTED"

  useEffect(() => {
    // Increment view count
    fetch(`/api/plans/${plan.slug}/view`, { method: "POST" })
  }, [plan.slug])

  const handleLike = async () => {
    if (!session) {
      alert("Beğenmek için giriş yapmalısınız")
      return
    }

    const previousLiked = liked
    const previousCount = likeCount

    console.log('Before like:', { previousLiked, previousCount })

    try {
      const res = await fetch(`/api/plans/${plan.slug}/like`, { method: "POST" })
      const data = await res.json()

      console.log('API response:', data)

      // Önce optimistic update yap
      if (data.liked) {
        // Beğeni eklendi
        setLiked(true)
        setLikeCount(previousCount + 1)
        console.log('Adding like: +1, new count:', previousCount + 1)
      } else {
        // Beğeni kaldırıldı
        setLiked(false)
        setLikeCount(Math.max(0, previousCount - 1))
        console.log('Removing like: -1, new count:', Math.max(0, previousCount - 1))
      }
    } catch (error) {
      console.error("Like error:", error)
      // Hata durumunda geri al
      setLiked(previousLiked)
      setLikeCount(previousCount)
      alert("Bir hata oluştu, lütfen tekrar deneyin")
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      alert("Yorum yapmak için giriş yapmalısınız")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody, planId: plan.id })
      })
      const data = await res.json()
      setComments([data.comment, ...comments])
      setCommentBody("")
    } catch (error) {
      console.error("Comment error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setComments(comments.filter((c: any) => c.id !== commentId))
      } else {
        const data = await res.json()
        alert(data.error || "Yorum silinemedi")
      }
    } catch (error) {
      console.error("Delete comment error:", error)
      alert("Bir hata oluştu")
    }
  }

  const handleApprovePlan = async () => {
    if (!confirm("Bu planı onaylamak istediğinize emin misiniz?")) {
      return
    }

    setApproving(true)
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/approve`, {
        method: "POST",
      })

      if (res.ok) {
        alert("Plan onaylandı! Sayfa yenilenecek.")
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || "Plan onaylanamadı")
      }
    } catch (error) {
      console.error("Approve error:", error)
      alert("Bir hata oluştu")
    } finally {
      setApproving(false)
    }
  }

  const handleRejectPlan = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      alert("Lütfen en az 10 karakter uzunluğunda bir ret sebebi girin")
      return
    }

    setRejecting(true)
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      })

      if (res.ok) {
        alert("Plan reddedildi! Sayfa yenilenecek.")
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || "Plan reddedilemedi")
      }
    } catch (error) {
      console.error("Reject error:", error)
      alert("Bir hata oluştu")
    } finally {
      setRejecting(false)
    }
  }

  const weightLoss = plan.startWeight - plan.goalWeight
  const lossPercentage = ((weightLoss / plan.startWeight) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Main Card */}
        <div className="relative group mb-12">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500" />

          <Card className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-white/5" />

            <CardHeader className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white p-8 md:p-12">
              {/* Admin Status Badge */}
              {isAdmin && (isPending || isRejected) && (
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg shadow-xl ${isPending
                      ? "bg-yellow-500 text-yellow-900"
                      : "bg-red-500 text-white"
                    }`}>
                    <span className="text-2xl">{isPending ? "⏳" : "❌"}</span>
                    <span>{isPending ? "Onay Bekliyor" : "Reddedildi"}</span>
                  </div>
                </div>
              )}

              {/* Author Info & Edit Button */}
              <div className="flex items-center justify-between mb-6">
                <Link
                  href={`/profile/${plan.user.id}`}
                  className="flex items-center gap-4 hover:opacity-90 transition-opacity group/author"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 backdrop-blur-xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30 group-hover/author:scale-110 transition-transform shadow-xl">
                    {plan.user.image ? (
                      <img
                        src={plan.user.image}
                        alt={plan.user.name || "Profil"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{plan.user.name?.[0]?.toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-xl">{plan.user.name || "Anonim"}</p>
                    <p className="text-sm text-white/90 flex items-center gap-2">
                      <span>📅</span>
                      {new Date(plan.createdAt).toLocaleDateString("tr-TR", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </Link>

                {/* Edit Button - Sadece plan sahibi görebilir */}
                {session?.user?.id === plan.user.id && (
                  <Link
                    href={`/plan/${plan.slug}/edit`}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl font-bold transition-all"
                  >
                    <span>✏️</span>
                    <span>Düzenle</span>
                  </Link>
                )}
              </div>

              {/* Title */}
              <CardTitle className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                {plan.title}
              </CardTitle>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <p className="text-white/80 text-sm mb-1">Başlangıç</p>
                  <p className="text-3xl font-bold">{plan.startWeight}kg</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <p className="text-white/80 text-sm mb-1">Hedef</p>
                  <p className="text-3xl font-bold">{plan.goalWeight}kg</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-xl rounded-2xl p-4 border border-green-400/30">
                  <p className="text-white/80 text-sm mb-1">Kayıp</p>
                  <p className="text-3xl font-bold text-green-300">-{weightLoss}kg</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-xl rounded-2xl p-4 border border-yellow-400/30">
                  <p className="text-white/80 text-sm mb-1">Oran</p>
                  <p className="text-3xl font-bold text-yellow-300">-{lossPercentage}%</p>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
                <span className="text-2xl">⏱️</span>
                <span className="font-bold text-lg">{plan.durationText}</span>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-8 pt-8">
              {/* Image Section */}
              {plan.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={plan.imageUrl}
                    alt={plan.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                </div>
              )}

              {/* Video Section */}
              {plan.videoUrl && (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-lg opacity-20" />
                  <div className="relative bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl p-6 rounded-2xl border border-red-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-xl">🎥</span>
                      </div>
                      <h3 className="font-bold text-2xl text-white">Video</h3>
                    </div>
                    <VideoEmbed url={plan.videoUrl} />
                  </div>
                </div>
              )}

              {/* Admin Action Buttons */}
              {isAdmin && isPending && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Admin Onay Paneli
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleApprovePlan}
                      disabled={approving}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-2xl">✅</span>
                      <span>{approving ? "Onaylanıyor..." : "Planı Onayla"}</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={rejecting}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-2xl">❌</span>
                      <span>Planı Reddet</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Reason Display */}
              {isRejected && plan.rejectionReason && (
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-red-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">❌</span>
                    Plan Reddedildi
                  </h3>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-red-500/30">
                    <p className="text-sm font-semibold text-red-400 mb-2">Ret Sebebi:</p>
                    <p className="text-gray-300 leading-relaxed">{plan.rejectionReason}</p>
                  </div>
                  {session?.user?.id === plan.user.id && (
                    <p className="text-sm text-gray-400 mt-4">
                      💡 Planınızı düzenleyerek tekrar onaya gönderebilirsiniz.
                    </p>
                  )}
                </div>
              )}

              {/* Reject Modal */}
              {showRejectModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-red-500/30 shadow-2xl max-w-2xl w-full p-8">
                    <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="text-4xl">❌</span>
                      Planı Reddet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Lütfen planın neden reddedildiğini açıklayın. Kullanıcı bu mesajı görecek ve planını düzenleyebilecek.
                    </p>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Örn: Plan içeriği yeterince detaylı değil. Lütfen beslenme programınızı daha detaylı açıklayın..."
                      rows={6}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-xl mb-2"
                    />
                    <p className="text-sm text-gray-500 mb-6">
                      {rejectionReason.length}/500 karakter (minimum 10)
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={handleRejectPlan}
                        disabled={rejecting || rejectionReason.trim().length < 10}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-2xl">❌</span>
                        <span>{rejecting ? "Reddediliyor..." : "Reddet"}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectModal(false)
                          setRejectionReason("")
                        }}
                        disabled={rejecting}
                        className="px-6 py-4 bg-gray-700 text-white rounded-xl font-bold text-lg hover:bg-gray-600 transition-all disabled:opacity-50"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interaction Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg transition-all shadow-lg ${liked
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30 scale-105"
                    : "bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-red-500/50 hover:bg-gray-800"
                    }`}
                >
                  <Heart className={`w-6 h-6 ${liked ? "fill-current animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                  <span>{likeCount}</span>
                </button>
                <FavoriteButton planId={plan.id} showLabel />
                {session && <AddToCollectionButton planId={plan.id} />}
                <PdfExportButton slug={plan.slug} title={plan.title} />
                <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl font-bold text-lg">
                  <Eye className="w-6 h-6" />
                  <span>{plan.views}</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl font-bold text-lg">
                  <MessageCircle className="w-6 h-6" />
                  <span>{comments.length}</span>
                </div>
                <div className="ml-auto">
                  <ShareButtons
                    title={plan.title}
                    url={`/plan/${plan.slug}`}
                    description={`${plan.startWeight}kg → ${plan.goalWeight}kg | ${plan.durationText} | ${plan.routine.substring(0, 100)}...`}
                  />
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-6">
                {/* Routine */}
                <div className="relative group/section">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover/section:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl p-8 rounded-2xl border border-blue-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">📅</span>
                      </div>
                      <h3 className="font-bold text-3xl text-white">Günlük Rutin</h3>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">{plan.routine}</p>
                  </div>
                </div>

                {/* Diet */}
                <div className="relative group/section">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-20 group-hover/section:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl p-8 rounded-2xl border border-green-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🥗</span>
                      </div>
                      <h3 className="font-bold text-3xl text-white">Beslenme Planı</h3>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">{plan.diet}</p>
                  </div>
                </div>

                {/* Exercise */}
                <div className="relative group/section">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-lg opacity-20 group-hover/section:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl p-8 rounded-2xl border border-orange-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">💪</span>
                      </div>
                      <h3 className="font-bold text-3xl text-white">Egzersiz Programı</h3>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">{plan.exercise}</p>
                  </div>
                </div>

                {/* Motivation */}
                <div className="relative group/section">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-30 group-hover/section:opacity-40 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">✨</span>
                      </div>
                      <h3 className="font-bold text-3xl text-white">Motivasyon</h3>
                    </div>
                    <p className="text-gray-300 italic text-xl font-medium leading-relaxed">{plan.motivation}</p>
                  </div>
                </div>

                {/* Shopping List */}
                <div className="relative group/section">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-20 group-hover/section:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl p-8 rounded-2xl border border-green-500/30">
                    <ShoppingList 
                      planId={plan.id}
                      planTitle={plan.title}
                      dietContent={plan.diet}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-4xl font-bold text-white">
              Yorumlar <span className="text-gray-500">({comments.length})</span>
            </h3>
          </div>

          {session ? (
            <form onSubmit={handleComment} className="mb-8">
              <div className="relative group/form">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-20 group-hover/form:opacity-30 transition-opacity" />
                <Card className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10">
                  <CardContent className="pt-6">
                    <Textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Düşüncelerinizi paylaşın..."
                      className="mb-4 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                      rows={4}
                      required
                    />
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Gönderiliyor...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          Yorum Yap
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          ) : (
            <Card className="mb-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30">
              <CardContent className="pt-6 text-center py-8">
                <div className="w-16 h-16 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💡</span>
                </div>
                <p className="text-xl font-bold text-white mb-2">
                  Yorum yapmak için giriş yapmalısınız
                </p>
                <Link href="/login">
                  <Button className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
                    Giriş Yap
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700">
                <CardContent className="pt-6 text-center py-12">
                  <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl">📭</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    Henüz yorum yok
                  </p>
                  <p className="text-gray-400">
                    İlk yorumu yapan siz olun!
                  </p>
                </CardContent>
              </Card>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className="relative group/comment">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur opacity-0 group-hover/comment:opacity-100 transition-opacity" />
                  <Card className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                          {comment.user.image ? (
                            <img
                              src={comment.user.image}
                              alt={comment.user.name || "Profil"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{comment.user.name?.[0]?.toUpperCase() || "?"}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white text-lg">{comment.user.name || "Anonim"}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            {session && (session.user.id === comment.userId || session.user.role === "ADMIN") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-semibold"
                              >
                                🗑️ Sil
                              </Button>
                            )}
                          </div>
                          <p className="text-gray-300 text-base leading-relaxed">{comment.body}</p>

                          {/* Emoji Reactions */}
                          <CommentReactions
                            commentId={comment.id}
                            initialReactions={comment.reactions?.map((r: any) => ({
                              emoji: r.emoji,
                              userId: r.user.id
                            })) || []}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Similar Plans */}
        {similarPlans.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-4xl font-bold text-white">
                Benzer Planlar
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarPlans.map((similarPlan: any) => {
                const weightLoss = similarPlan.startWeight - similarPlan.goalWeight
                return (
                  <Link key={similarPlan.id} href={`/plan/${similarPlan.slug}`}>
                    <div className="relative group/similar h-full">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover/similar:opacity-40 transition-opacity" />
                      <Card className="relative h-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-all">
                        <CardHeader>
                          <h4 className="font-bold text-xl text-white line-clamp-2 group-hover/similar:text-blue-400 transition-colors">
                            {similarPlan.title}
                          </h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg">
                              -{weightLoss}kg
                            </span>
                            <span className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl text-sm font-semibold border border-gray-600">
                              {similarPlan.durationText}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                            <span className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              {similarPlan.views}
                            </span>
                            <span className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-red-400" />
                              {similarPlan._count.likes}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
