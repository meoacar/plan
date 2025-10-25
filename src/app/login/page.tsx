"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

interface OAuthSettings {
  googleEnabled: boolean
  facebookEnabled: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [oauthSettings, setOauthSettings] = useState<OAuthSettings>({
    googleEnabled: false,
    facebookEnabled: false,
  })

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Kayıt başarılı! Şimdi giriş yapabilirsiniz.")
    }

    // OAuth ayarlarını getir
    fetch("/api/auth/oauth-status")
      .then((res) => res.json())
      .then((data) => {
        setOauthSettings({
          googleEnabled: data.googleEnabled || false,
          facebookEnabled: data.facebookEnabled || false,
        })
      })
      .catch(() => {
        // Hata durumunda sessizce devam et
      })
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

  const showOAuthSection = oauthSettings.googleEnabled || oauthSettings.facebookEnabled

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
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-sm text-[#2d7a4a] hover:underline font-semibold">
                  Şifremi Unuttum
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? "⏳ Giriş yapılıyor..." : "✅ Giriş Yap"}
            </Button>
          </form>

          {showOAuthSection && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-700 font-semibold">veya</span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {oauthSettings.googleEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-bold"
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                  >
                    🌐 Google ile Giriş Yap
                  </Button>
                )}

                {oauthSettings.facebookEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-bold bg-[#1877f2] text-white hover:bg-[#166fe5] hover:text-white"
                    onClick={() => signIn("facebook", { callbackUrl: "/" })}
                  >
                    📘 Facebook ile Giriş Yap
                  </Button>
                )}
              </div>
            </div>
          )}

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
