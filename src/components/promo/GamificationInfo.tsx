"use client";

import { Trophy, Heart, MessageCircle, Share2, Award } from "lucide-react";

export default function GamificationInfo() {
  const rewards = [
    {
      icon: Heart,
      action: "Beğeni",
      xp: "+2 XP",
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      icon: MessageCircle,
      action: "Yorum",
      xp: "+5 XP",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Share2,
      action: "Plan Paylaş",
      xp: "Yeni Rozet 🎖️",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: Award,
      action: "Günah Duvarı",
      xp: "Sırdaş Rozeti 💬",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-green-600 to-green-700 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Her Adımında XP Kazan, Seviye Atla!
          </h2>
          <p className="text-green-100 text-lg">
            Etkileşimlerinle rozet kazan ve topluluğun bir parçası ol
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {rewards.map((reward, index) => {
            const Icon = reward.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all hover:scale-105"
              >
                <div
                  className={`w-16 h-16 ${reward.bg} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-8 h-8 ${reward.color}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{reward.action}</h3>
                <p className="text-2xl font-bold text-yellow-300">
                  {reward.xp}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-green-100 text-lg mb-6">
            İnsanlar oyunlaştırmayı görsel olarak hemen kavrar 🎮
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-bold hover:bg-green-50 transition-colors">
            Hemen Başla
          </button>
        </div>
      </div>
    </section>
  );
}
