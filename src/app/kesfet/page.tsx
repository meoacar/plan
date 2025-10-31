"use client";

import FeaturesSection from "@/components/promo/FeaturesSection";
import UserStoriesSection from "@/components/promo/UserStoriesSection";
import GamificationInfo from "@/components/promo/GamificationInfo";
import Link from "next/link";
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export default function KesfetPage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Plan değil, Yol Arkadaşı</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Bu Sitede Neler Yapabilirsin?
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-8">
              Gerçek insanlardan, gerçek planlar. Kendine özel kilo planını oluştur, paylaş, ilham al.
            </p>
            {session ? (
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-xl"
              >
                <LayoutDashboard className="w-5 h-5" />
                Paneline Git
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-xl"
              >
                Hemen Başla
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* User Stories Section */}
      <UserStoriesSection />

      {/* Gamification Info */}
      <GamificationInfo />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Hazır mısın?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Yolculuğuna bugün başla. Seni bekleyen bir topluluk var! 🎉
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link
                    href="/submit"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-all hover:scale-105 shadow-xl"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Plan Oluştur
                  </Link>
                  <Link
                    href={`/profile/${session.user.id}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-lg"
                  >
                    Profilime Git
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-all hover:scale-105 shadow-xl"
                  >
                    Ücretsiz Kayıt Ol
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/plan"
                    className="inline-flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-lg"
                  >
                    Planları İncele
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
