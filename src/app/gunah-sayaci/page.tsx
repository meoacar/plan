"use client";

import { useState } from "react";
import CheatMealTracker from "@/components/cheat-meal-tracker";
import CheatMealCalendar from "@/components/cheat-meal-calendar";
import CheatMealChallenge from "@/components/cheat-meal-challenge";
import CheatMealBadges from "@/components/cheat-meal-badges";

export default function GunahSayaciPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCheatMealAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            😈 Yemek Günah Sayacı
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Günah mı, sadece kaçamak mı? Sen karar ver! Beslenme alışkanlıklarını
            mizahla takip et, farkındalık yarat. 🍰
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Tracker */}
          <CheatMealTracker onCheatMealAdded={handleCheatMealAdded} />

          {/* Calendar & Challenge Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheatMealCalendar refreshTrigger={refreshTrigger} />
            <CheatMealChallenge refreshTrigger={refreshTrigger} />
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              💡 Nasıl Çalışır?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">1️⃣</div>
                <h4 className="font-semibold text-gray-800 mb-2">Kaçamak Ekle</h4>
                <p className="text-sm text-gray-600">
                  Tatlı, fast food, gazlı içecek... Ne yediysen kaydet!
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">2️⃣</div>
                <h4 className="font-semibold text-gray-800 mb-2">Takip Et</h4>
                <p className="text-sm text-gray-600">
                  Haftalık takvimde göster, istatistikleri incele.
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">3️⃣</div>
                <h4 className="font-semibold text-gray-800 mb-2">Challenge Oluştur</h4>
                <p className="text-sm text-gray-600">
                  Kendine limit koy, aşarsan eğlenceli ceza!
                </p>
              </div>
            </div>
          </div>

          {/* Rozetler */}
          <CheatMealBadges />
        </div>
      </div>
    </div>
  );
}
