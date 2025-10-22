"use client"

import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
    planId: string
    showLabel?: boolean
    className?: string
}

export function FavoriteButton({
    planId,
    showLabel = false,
    className = ""
}: FavoriteButtonProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isFavorited, setIsFavorited] = useState(false)
    const [favoriteId, setFavoriteId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (session?.user) {
            checkFavoriteStatus()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, planId])

    const checkFavoriteStatus = async () => {
        try {
            const res = await fetch("/api/favorites/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            })

            if (res.ok) {
                const data = await res.json()
                setIsFavorited(data.isFavorited)
                setFavoriteId(data.favoriteId)
            }
        } catch (error) {
            console.error("Favori kontrolü hatası:", error)
        }
    }

    const handleToggleFavorite = async () => {
        if (!session?.user) {
            router.push("/login")
            return
        }

        setIsLoading(true)

        try {
            if (isFavorited && favoriteId) {
                // Favorilerden çıkar
                const res = await fetch(`/api/favorites/${favoriteId}`, {
                    method: "DELETE",
                })

                if (res.ok) {
                    setIsFavorited(false)
                    setFavoriteId(null)
                } else {
                    const data = await res.json()
                    alert(data.error || "Bir hata oluştu")
                }
            } else {
                // Favorilere ekle
                const res = await fetch("/api/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId }),
                })

                if (res.ok) {
                    const data = await res.json()
                    setIsFavorited(true)
                    setFavoriteId(data.favorite.id)
                } else {
                    const data = await res.json()
                    alert(data.error || "Bir hata oluştu")
                }
            }
        } catch (error) {
            console.error("Favori işlemi hatası:", error)
            alert("Bir hata oluştu")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isFavorited
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            title={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
            <Bookmark
                className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
            />
            {showLabel && (
                <span className="text-sm font-medium">
                    {isFavorited ? "Favorilerde" : "Favorilere Ekle"}
                </span>
            )}
        </button>
    )
}
