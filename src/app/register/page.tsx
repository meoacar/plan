"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthSettings, setOauthSettings] = useState<OAuthSettings>({
    googleEnabled: false,
    facebookEnabled: false,
  })

  useEffect(() => {
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
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu")
        return
      }

      router.push("/login?registered=true")
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
          <CardTitle className="text-center text-3xl font-bold">✨ Kayıt Ol</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-800 p-4 rounded-lg text-sm font-semibold">
                ⚠️ {error}
              </div>
            )}
            
            <div>
              <label className="block text-base font-bold mb-2 text-gray-800">👤 İsim</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Adınız Soyadınız"
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-2 text-gray-800">📧 Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-2 text-gray-800">🔒 Şifre</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? "⏳ Kayıt yapılıyor..." : "🚀 Kayıt Ol"}
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
                    🌐 Google ile Kayıt Ol
                  </Button>
                )}

                {oauthSettings.facebookEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-bold bg-[#1877f2] text-white hover:bg-[#166fe5] hover:text-white"
                    onClick={() => signIn("facebook", { callbackUrl: "/" })}
                  >
                    📘 Facebook ile Kayıt Ol
                  </Button>
                )}
              </div>
            </div>
          )}

          <p className="text-center text-base text-gray-800 mt-6 font-medium">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-[#2d7a4a] hover:underline font-bold">
              Giriş Yap
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
