"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Kayıt başarılı! Şimdi giriş yapabilirsiniz.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email veya şifre hatalı")
      } else {
        router.push("/")
        router.refresh()
      }
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
          <CardTitle className="text-center text-3xl font-bold">🔐 Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {successMessage && (
              <div className="bg-green-100 border-2 border-green-400 text-green-800 p-4 rounded-lg text-sm font-semibold">
                ✅ {successMessage}
              </div>
            )}
            
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

            <div>
              <label className="block text-base font-bold mb-2 text-gray-800">🔒 Şifre</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? "⏳ Giriş yapılıyor..." : "✅ Giriş Yap"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-700 font-semibold">veya</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 h-12 text-base font-bold"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              🌐 Google ile Giriş Yap
            </Button>
          </div>

          <p className="text-center text-base text-gray-800 mt-6 font-medium">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="text-[#2d7a4a] hover:underline font-bold">
              Kayıt Ol
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
