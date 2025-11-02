"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import Link from "next/link"

interface Comment {
  id: string
  body: string
  status: string
  isSpam: boolean
  moderatedAt: Date | null
  moderationNote: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  plan: {
    id: string
    title: string
    slug: string
  }
  moderator: {
    name: string
  } | null
}

interface CommentDetailModalProps {
  comment: Comment
  onClose: () => void
  onModerate: (id: string, action: "approve" | "reject" | "spam", note?: string) => void
  onDelete: (id: string) => void
  loading: boolean
}

export function CommentDetailModal({
  comment,
  onClose,
  onModerate,
  onDelete,
  loading
}: CommentDetailModalProps) {
  const [moderationNote, setModerationNote] = useState(comment.moderationNote || "")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>💬 Yorum Detayı</span>
            <Button variant="ghost" onClick={onClose} className="font-bold">
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Durum */}
          <div>
            <label className="block text-sm font-medium mb-2">Durum</label>
            <div className="flex items-center gap-2">
              {comment.isSpam && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded font-bold">
                  🚫 SPAM
                </span>
              )}
              <span className={`px-3 py-1 rounded font-bold ${
                comment.status === "APPROVED" ? "bg-green-100 text-green-800" :
                comment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {comment.status === "APPROVED" ? "✅ Onaylı" :
                 comment.status === "PENDING" ? "⏳ Beklemede" :
                 "❌ Reddedildi"}
              </span>
            </div>
          </div>

          {/* Yorum İçeriği */}
          <div>
            <label className="block text-sm font-medium mb-2">Yorum</label>
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">{comment.body}</p>
            </div>
          </div>

          {/* Yazar Bilgileri */}
          <div>
            <label className="block text-sm font-medium mb-2">Yazar</label>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              {comment.user.image && (
                <img
                  src={comment.user.image}
                  alt={comment.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <Link
                  href={`/profile/${comment.user.id}`}
                  target="_blank"
                  className="font-bold text-blue-600 hover:underline"
                >
                  {comment.user.name || "Anonim"}
                </Link>
                <p className="text-sm text-gray-600">{comment.user.email}</p>
              </div>
            </div>
          </div>

          {/* Plan Bilgileri */}
          <div>
            <label className="block text-sm font-medium mb-2">Plan</label>
            <Link
              href={`/plan/${comment.plan.slug}`}
              target="_blank"
              className="block p-3 bg-green-50 rounded-lg border-2 border-green-200 hover:bg-green-100 transition-colors"
            >
              <p className="font-bold text-green-700">{comment.plan.title}</p>
              <p className="text-sm text-gray-600">Plana git →</p>
            </Link>
          </div>

          {/* Tarih Bilgileri */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Oluşturma Tarihi</label>
              <p className="text-gray-700">
                {new Date(comment.createdAt).toLocaleString("tr-TR")}
              </p>
            </div>
            {comment.moderatedAt && (
              <div>
                <label className="block text-sm font-medium mb-2">Moderasyon Tarihi</label>
                <p className="text-gray-700">
                  {new Date(comment.moderatedAt).toLocaleString("tr-TR")}
                </p>
              </div>
            )}
          </div>

          {/* Moderatör Bilgisi */}
          {comment.moderator && (
            <div>
              <label className="block text-sm font-medium mb-2">Moderatör</label>
              <p className="text-purple-600 font-medium">⚖️ {comment.moderator.name}</p>
            </div>
          )}

          {/* Moderasyon Notu */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Moderasyon Notu (Opsiyonel)
            </label>
            <Input
              type="text"
              placeholder="Moderasyon sebebi veya not..."
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              className="w-full"
            />
            {comment.moderationNote && (
              <p className="mt-2 text-sm text-gray-600 italic">
                Mevcut not: {comment.moderationNote}
              </p>
            )}
          </div>

          {/* İşlem Butonları */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {comment.status !== "APPROVED" && (
              <Button
                onClick={() => onModerate(comment.id, "approve", moderationNote)}
                disabled={loading}
                className="flex-1 font-bold bg-green-600 hover:bg-green-700"
              >
                {loading ? "⏳ İşleniyor..." : "✅ Onayla"}
              </Button>
            )}
            {comment.status !== "REJECTED" && (
              <Button
                onClick={() => onModerate(comment.id, "reject", moderationNote)}
                disabled={loading}
                variant="outline"
                className="flex-1 font-bold text-orange-600 border-orange-600"
              >
                {loading ? "⏳ İşleniyor..." : "❌ Reddet"}
              </Button>
            )}
            {!comment.isSpam && (
              <Button
                onClick={() => onModerate(comment.id, "spam", moderationNote)}
                disabled={loading}
                variant="outline"
                className="flex-1 font-bold text-red-600 border-red-600"
              >
                {loading ? "⏳ İşleniyor..." : "🚫 Spam İşaretle"}
              </Button>
            )}
            <Button
              onClick={() => {
                if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
                  onDelete(comment.id)
                  onClose()
                }
              }}
              disabled={loading}
              variant="destructive"
              className="w-full font-bold"
            >
              {loading ? "⏳ Siliniyor..." : "🗑️ Yorumu Sil"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
