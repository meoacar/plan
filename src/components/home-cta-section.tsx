"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, ArrowRight, Heart, User } from "lucide-react"

export function HomeCTASection() {
  const { data: session } = useSession()

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="px-4 mx-auto max-w-4xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">Hemen Başla</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          Senin Hikayeni Duymak İstiyoruz! 💪
        </h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Dönüşüm yolculuğunu başlat, topluluğumuzla paylaş ve binlerce kişiye ilham ver.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {session?.user ? (
            <Link href="/submit">
              <Button className="h-14 px-8 bg-white text-purple-900 hover:bg-gray-100 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Zap className="w-5 h-5 mr-2" />
                Hikayeni Paylaş
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button className="h-14 px-8 bg-white text-purple-900 hover:bg-gray-100 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <User className="w-5 h-5 mr-2" />
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
          <Link href="/kesfet">
            <Button className="h-14 px-8 bg-white/10 border-2 border-white hover:bg-white/20 rounded-xl font-semibold text-lg text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg">
              <Heart className="w-5 h-5 mr-2" />
              Daha Fazla Keşfet
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
