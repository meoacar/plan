"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu")
        return
      }

      setSuccess(true)
    } catch (error) {
      setError("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white rounded-t-xl">
          <CardTitle className="text-center text-3xl font-bold">🔑 Şifremi Unuttum</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-100 border-2 border-green-400 text-green-800 p-4 rounded-lg text-sm font-semibold">
                ✅ Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.
              </div>
              <Link href="/login">
                <Button className="w-full h-12 text-lg font-bold">
                  ← Giriş Sayfasına Dön
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-gray-700 text-sm">
                Email adresinizi girin, size şifre sıfırlama linki gönderelim.
              </p>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-800 p-4 rounded-lg text-sm font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-base font-bold mb-2 text-gray-800">📧 Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                {loading ? "⏳ Gönderiliyor..." : "📨 Sıfırlama Linki Gönder"}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-[#2d7a4a] hover:underline font-semibold text-sm">
                  ← Giriş sayfasına dön
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
