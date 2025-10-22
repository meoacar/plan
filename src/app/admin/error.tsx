"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="text-9xl font-extrabold text-red-600 mb-6">⚠️</div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Admin Hatası
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Admin panelinde bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={reset}
            className="font-bold text-lg px-8 py-6 h-auto"
          >
            🔄 Tekrar Dene
          </Button>
          <Link href="/admin">
            <Button
              size="lg"
              variant="outline"
              className="font-bold text-lg px-8 py-6 h-auto"
            >
              ⚙️ Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
