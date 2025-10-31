"use client";

import FeaturesSection from "@/components/promo/FeaturesSection";
import UserStoriesSection from "@/components/promo/UserStoriesSection";
import GamificationInfo from "@/components/promo/GamificationInfo";
import Link from "next/link";
import { ArrowRight, Sparkles, LayoutDashboard, Star, Users, TrendingUp, Heart } from "lucide-react";
import { useSession } from "next-auth/react";

export default function KesfetPage() {
  const { data: session } = useSession();

  const stats = [
    { icon: Users, value: "10,000+", label: "Aktif Kullanıcı" },
    { icon: TrendingUp, value: "50,000+", label: "Paylaşılan Plan" },
    { icon: Heart, value: "1M+", label: "Destek Mesajı" },
    { icon: Star, value: "4.9/5", label: "Kullanıcı Puanı" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Daha Etkileyici */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 text-white py-24 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 animate-fade-in border border-white/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-semibold text-sm md:text-base">Plan değil, Yol Arkadaşı 🚀</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up">
              Hayalindeki Vücuda
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                Birlikte Ulaş
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-green-50 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Gerçek insanlardan gerçek planlar. Kendine özel kilo planını oluştur,
              paylaş ve binlerce kişiyle birlikte ilham al. 💪
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-300">
              {session ? (
                <>
                  <Link
                    href="/submit"
                    className="group inline-flex items-center gap-2 bg-white text-green-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-2xl hover:shadow-green-300/50"
                  >
                    <LayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Paneline Git
                  </Link>
                  <Link
                    href={`/profile/${session.user.id}`}
                    className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all hover:scale-105"
                  >
                    Profilim
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 bg-white text-green-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-2xl hover:shadow-green-300/50"
                  >
                    Ücretsiz Başla
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/plan"
                    className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all hover:scale-105"
                  >
                    Planları Keşfet
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up delay-400">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                  >
                    <Icon className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                    <div className="text-3xl font-black mb-1">{stat.value}</div>
                    <div className="text-sm text-green-100">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* User Stories Section */}
      <UserStoriesSection />

      {/* Gamification Info */}
      <GamificationInfo />

      {/* Final CTA Section - Daha Güçlü */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-green-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Hazır mısın?
              </h2>

              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Yolculuğuna bugün başla. Seni bekleyen binlerce destekçi,
                sınırsız motivasyon ve harika bir topluluk var! 🎉
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {session ? (
                  <>
                    <Link
                      href="/submit"
                      className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      <LayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Plan Oluştur
                    </Link>
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="group inline-flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-lg"
                    >
                      Profilime Git
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      Ücretsiz Kayıt Ol
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/plan"
                      className="group inline-flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-lg"
                    >
                      Planları İncele
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">Neden Zayıflama Planım?</p>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>100% Ücretsiz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Gerçek Topluluk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Kanıtlanmış Sonuçlar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>7/24 Destek</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
