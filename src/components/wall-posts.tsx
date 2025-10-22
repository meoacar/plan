"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
// @ts-ignore - Avatar component exists but TS server needs restart
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WallPost {
    id: string
    content: string
    isPublic: boolean
    createdAt: string
    author: {
        id: string
        name: string | null
        image: string | null
    }
}

interface WallPostsProps {
    userId: string
    isOwnProfile: boolean
}

export default function WallPosts({ userId, isOwnProfile }: WallPostsProps) {
    const { data: session } = useSession()
    const [posts, setPosts] = useState<WallPost[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)

    useEffect(() => {
        loadPosts()
    }, [userId, page])

    const loadPosts = async () => {
        try {
            setLoading(true)
            const response = await fetch(
                `/api/wall-posts?userId=${userId}&page=${page}&limit=10`
            )
            const data = await response.json()

            if (response.ok) {
                if (page === 1) {
                    setPosts(data.posts)
                } else {
                    setPosts((prev) => [...prev, ...data.posts])
                }
                setHasMore(data.pagination.page < data.pagination.totalPages)
            }
        } catch (error) {
            console.error("Error loading wall posts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!session?.user?.id || !content.trim()) return

        try {
            setSubmitting(true)
            const response = await fetch("/api/wall-posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    content: content.trim(),
                    isPublic,
                }),
            })

            if (response.ok) {
                const newPost = await response.json()
                setPosts([newPost, ...posts])
                setContent("")
                setIsPublic(true)
            } else {
                const error = await response.json()
                alert(error.error || "Mesaj gönderilemedi")
            }
        } catch (error) {
            console.error("Error posting message:", error)
            alert("Bir hata oluştu")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (postId: string) => {
        if (!confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return

        try {
            const response = await fetch(`/api/wall-posts/${postId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setPosts(posts.filter((p) => p.id !== postId))
            } else {
                const error = await response.json()
                alert(error.error || "Mesaj silinemedi")
            }
        } catch (error) {
            console.error("Error deleting message:", error)
            alert("Bir hata oluştu")
        }
    }

    const canPost = session?.user?.id && session.user.id !== userId

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    Duvar Yazıları
                    <span className="text-sm font-normal text-gray-500">
                        ({posts.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mesaj Yazma Formu */}
                {canPost && (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Bir mesaj bırak..."
                            className="min-h-[100px] resize-none"
                            maxLength={1000}
                            disabled={submitting}
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="rounded"
                                    disabled={submitting}
                                />
                                Herkese açık
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    {content.length}/1000
                                </span>
                                <Button
                                    type="submit"
                                    disabled={!content.trim() || submitting}
                                    size="sm"
                                >
                                    {submitting ? "Gönderiliyor..." : "Gönder"}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Mesajlar Listesi */}
                {loading && page === 1 ? (
                    <div className="text-center py-8 text-gray-500">
                        Yükleniyor...
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📭</div>
                        <p>Henüz mesaj yok</p>
                        {canPost && (
                            <p className="text-sm mt-1">İlk mesajı sen bırak!</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => {
                            const canDelete =
                                session?.user?.id === post.author.id ||
                                session?.user?.id === userId

                            return (
                                <div
                                    key={post.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <Link href={`/profile/${post.author.id}`}>
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={post.author.image || undefined} />
                                                <AvatarFallback>
                                                    {post.author.name?.[0]?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <Link
                                                    href={`/profile/${post.author.id}`}
                                                    className="font-semibold text-gray-900 hover:underline"
                                                >
                                                    {post.author.name || "Anonim"}
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    {!post.isPublic && (
                                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                            🔒 Özel
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(post.createdAt), {
                                                            addSuffix: true,
                                                            locale: tr,
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap break-words">
                                                {post.content}
                                            </p>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="text-xs text-red-600 hover:text-red-800 mt-2"
                                                >
                                                    Sil
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Daha Fazla Yükle */}
                        {hasMore && (
                            <div className="text-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(page + 1)}
                                    disabled={loading}
                                >
                                    {loading ? "Yükleniyor..." : "Daha Fazla Göster"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
