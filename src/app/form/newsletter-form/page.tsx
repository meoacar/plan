'use client'

import { useState } from 'react'
import { Mail, Sparkles, CheckCircle2, Gift, TrendingUp, Heart, Zap, ArrowRight, Star } from 'lucide-react'

export default function NewsletterFormPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consent) {
      setMessage({ type: 'error', text: 'Lütfen e-bülten almayı kabul edin' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu')
      }

      setMessage({ type: 'success', text: data.message })
      setName('')
      setEmail('')
      setConsent(false)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Bir hata oluştu',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-fuchsia-200/20 to-violet-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white rounded-full shadow-2xl mb-6 hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-bold">🎁 Özel İçerikler Seni Bekliyor!</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="block text-gray-900 mb-2">Hayalindeki Vücuda</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 animate-gradient">
                Bir Adım Daha Yakın
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Her hafta <span className="font-bold text-violet-600">özel içerikler</span>, 
              <span className="font-bold text-fuchsia-600"> motivasyon hikayeleri</span> ve 
              <span className="font-bold text-pink-600"> pratik ipuçları</span> e-postanda!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Form Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 hover:shadow-violet-500/20 transition-all duration-300">
              {message && (
                <div
                  className={`mb-6 p-5 rounded-2xl flex items-start gap-3 animate-fade-in ${
                    message.type === 'success'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-800'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-violet-600" />
                    Adınız Soyadınız
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium hover:border-violet-300"
                    placeholder="Örn: Ayşe Yılmaz"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-fuchsia-600" />
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium hover:border-fuchsia-300"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-100">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 h-5 w-5 text-violet-600 focus:ring-violet-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700 font-medium cursor-pointer">
                    E-bülten almayı kabul ediyorum. İstediğim zaman abonelikten çıkabilirim. 
                    <span className="block text-xs text-gray-500 mt-1">Gizliliğiniz bizim için önemli 🔒</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Hemen Abone Ol
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-6">
                10,000+ kişi zaten abone oldu! 🎉
              </p>
            </div>

            {/* Benefits Section */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <Gift className="w-8 h-8 text-violet-600" />
                  E-bültende Neler Var?
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: Heart, text: 'Haftalık sağlıklı ve lezzetli tarifler', color: 'text-pink-600' },
                    { icon: TrendingUp, text: 'Kanıtlanmış zayıflama ipuçları', color: 'text-violet-600' },
                    { icon: Zap, text: 'Motivasyon artırıcı başarı hikayeleri', color: 'text-fuchsia-600' },
                    { icon: CheckCircle2, text: 'Pratik egzersiz önerileri', color: 'text-emerald-600' },
                    { icon: Gift, text: 'Sadece abonelere özel kampanyalar', color: 'text-amber-600' },
                    { icon: Sparkles, text: 'Uzman diyetisyen tavsiyeleri', color: 'text-blue-600' },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-4 group">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-gray-700 font-medium pt-2">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Proof */}
              <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-3xl shadow-xl p-8 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                </div>
                <p className="text-lg font-medium mb-3 leading-relaxed">
                  "E-bültendeki tarifler sayesinde 3 ayda 12 kilo verdim! Her hafta yeni motivasyon kaynağı oluyor."
                </p>
                <p className="text-sm text-white/80 font-medium">
                  - Zeynep K., İstanbul
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-black text-violet-600 mb-1">10K+</div>
                  <div className="text-xs text-gray-600 font-medium">Mutlu Abone</div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-black text-fuchsia-600 mb-1">500+</div>
                  <div className="text-xs text-gray-600 font-medium">Haftalık İçerik</div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-black text-pink-600 mb-1">%95</div>
                  <div className="text-xs text-gray-600 font-medium">Memnuniyet</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
