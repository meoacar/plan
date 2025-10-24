"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      setError("Geçersiz sıfırlama linki")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
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
          <CardTitle className="text-center text-3xl font-bold">🔐 Yeni Şifre Belirle</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-100 border-2 border-green-400 text-green-800 p-4 rounded-lg text-sm font-semibold">
                ✅ Şifreniz başarıyla değiştirildi! Giriş sayfasına yönlendiriliyorsunuz...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-800 p-4 rounded-lg text-sm font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-base font-bold mb-2 text-gray-800">🔒 Yeni Şifre</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-2 text-gray-800">🔒 Şifre Tekrar</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold" 
                disabled={loading || !token}
              >
                {loading ? "⏳ Kaydediliyor..." : "✅ Şifreyi Değiştir"}
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
