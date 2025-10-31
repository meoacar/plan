"use client";

import { Trophy, Heart, MessageCircle, Share2, Award, Zap, Target, Star } from "lucide-react";
import Link from "next/link";

export default function GamificationInfo() {
  const rewards = [
    {
      icon: Heart,
      action: "Beğeni Al",
      xp: "+2 XP",
      color: "text-red-500",
      bg: "bg-red-50",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: MessageCircle,
      action: "Yorum Yap",
      xp: "+5 XP",
      color: "text-blue-500",
      bg: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Share2,
      action: "Plan Paylaş",
      xp: "+10 XP",
      color: "text-green-500",
      bg: "bg-green-50",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Award,
      action: "Rozet Kazan",
      xp: "+50 XP",
      color: "text-purple-500",
      bg: "bg-purple-50",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const badges = [
    { emoji: "🔥", name: "Ateş Topu", desc: "7 gün üst üste aktif" },
    { emoji: "💪", name: "Güçlü", desc: "50 plan paylaş" },
    { emoji: "⭐", name: "Yıldız", desc: "1000 XP kazan" },
    { emoji: "👑", name: "Kral", desc: "Lider tablosunda 1." },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-400/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400/30 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mb-6 animate-bounce">
            <Trophy className="w-12 h-12 text-yellow-300" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
            Her Adımında XP Kazan,
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              Seviye Atla! 🎮
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Etkileşimlerinle rozet kazan, XP topla ve topluluğun en aktif üyesi ol
          </p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {rewards.map((reward, index) => {
            const Icon = reward.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-500 hover:scale-110 hover:-translate-y-2 border border-white/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${reward.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 ${reward.bg} rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    <Icon className={`w-10 h-10 ${reward.color}`} />
                  </div>
                  {/* Sparkle */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="w-6 h-6 text-yellow-300 fill-current animate-spin" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="font-bold text-xl mb-3 text-white">{reward.action}</h3>
                <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-black text-2xl shadow-lg">
                  {reward.xp}
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                Özel Rozetler Kazan 🏆
              </h3>
              <p className="text-white/80 text-lg">
                Başarılarını göster, topluluğa ilham ver
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all hover:scale-105 border border-white/10"
                >
                  <div className="text-5xl mb-3">{badge.emoji}</div>
                  <h4 className="font-bold text-white mb-2">{badge.name}</h4>
                  <p className="text-sm text-white/70">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar Example */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg">
                  12
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Seviye 12</div>
                  <div className="text-white/70 text-sm">Deneyimli Kullanıcı</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-lg">2,450 XP</div>
                <div className="text-white/70 text-sm">/ 3,000 XP</div>
              </div>
            </div>
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full" style={{ width: '82%' }}>
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="text-center mt-4 text-white/80 text-sm">
              <Zap className="w-4 h-4 inline mr-1" />
              550 XP kaldı bir sonraki seviyeye!
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/90 text-xl mb-8 font-semibold">
            Oyunlaştırma ile motivasyonunu yüksek tut! 🚀
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-white text-purple-600 px-12 py-5 rounded-full font-black text-xl hover:bg-gray-100 transition-all hover:scale-110 shadow-2xl hover:shadow-white/50"
          >
            <Target className="w-6 h-6" />
            Hemen Başla
            <Star className="w-6 h-6 fill-current text-yellow-500" />
          </Link>
        </div>
      </div>
    </section>
  );
}
