"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Coins, Zap } from "lucide-react";

interface StreakMilestone {
  days: number;
  coinReward: number;
  xpReward: number;
  badgeType?: string;
  description: string;
}

interface StreakDisplayProps {
  streak: number;
  nextMilestone: number;
  nextReward: StreakMilestone;
  availableMilestones?: StreakMilestone[];
  onClaimBonus?: (streakDays: number) => Promise<void>;
}

export function StreakDisplay({
  streak,
  nextMilestone,
  nextReward,
  availableMilestones = [],
  onClaimBonus,
}: StreakDisplayProps) {
  const [claiming, setClaiming] = useState<number | null>(null);

  // İlerleme yüzdesi hesapla
  const progressPercentage = nextMilestone
    ? Math.min((streak / nextMilestone) * 100, 100)
    : 100;

  // Kalan gün sayısı
  const daysRemaining = nextMilestone ? nextMilestone - streak : 0;

  const handleClaimBonus = async (streakDays: number) => {
    if (!onClaimBonus) return;

    setClaiming(streakDays);
    try {
      await onClaimBonus(streakDays);
    } catch (error) {
      console.error("Bonus talep edilirken hata:", error);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Ana Streak Kartı */}
      <Card className="overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-lg">
                  <Flame className="h-10 w-10 text-white" />
                </div>
                {streak >= 7 && (
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900 shadow-md">
                    🔥
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-4xl font-bold text-orange-600">{streak}</h3>
                <p className="text-sm font-medium text-gray-600">
                  Gün Üst Üste Aktif
                </p>
              </div>
            </div>

            {streak >= 7 && (
              <div className="hidden rounded-full bg-orange-100 px-4 py-2 sm:block">
                <p className="text-sm font-bold text-orange-700">
                  🎉 Harika!
                </p>
              </div>
            )}
          </div>

          {/* Motivasyon Mesajı */}
          {streak === 0 && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-sm font-medium text-blue-700">
                💪 Bugün başla ve streak'ini oluştur!
              </p>
            </div>
          )}

          {streak > 0 && streak < 7 && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-center">
              <p className="text-sm font-medium text-green-700">
                🌟 Harika başlangıç! Devam et!
              </p>
            </div>
          )}

          {streak >= 7 && streak < 30 && (
            <div className="mt-4 rounded-lg bg-orange-50 p-3 text-center">
              <p className="text-sm font-medium text-orange-700">
                🔥 Ateş gibisin! Momentum'u kaybetme!
              </p>
            </div>
          )}

          {streak >= 30 && (
            <div className="mt-4 rounded-lg bg-purple-50 p-3 text-center">
              <p className="text-sm font-medium text-purple-700">
                👑 Efsanesin! Bu disiplin inanılmaz!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Sonraki Milestone */}
      {nextMilestone && nextReward && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">
                Sonraki Hedef: {nextMilestone} Gün
              </h4>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">İlerleme</span>
                <span className="font-bold text-purple-600">
                  {streak} / {nextMilestone} gün
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-gray-600">
                {daysRemaining > 0
                  ? `${daysRemaining} gün kaldı`
                  : "Hedefe ulaştın! 🎉"}
              </p>
            </div>

            {/* Ödül Önizlemesi */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Kazanacağın Ödüller:
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-bold text-yellow-700">
                    {nextReward.coinReward} Coin
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700">
                    {nextReward.xpReward} XP
                  </span>
                </div>
                {nextReward.badgeType && (
                  <div className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1.5">
                    <Trophy className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-bold text-purple-700">
                      Özel Rozet
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Alınabilir Bonuslar */}
      {availableMilestones.length > 0 && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">
                Alınabilir Bonuslar
              </h4>
            </div>

            <div className="space-y-3">
              {availableMilestones.map((milestone) => (
                <div
                  key={milestone.days}
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {milestone.days} Gün Streak Bonusu
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-700">
                        <Coins className="h-3 w-3" />
                        {milestone.coinReward} Coin
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700">
                        <Zap className="h-3 w-3" />
                        {milestone.xpReward} XP
                      </span>
                      {milestone.badgeType && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-700">
                          <Trophy className="h-3 w-3" />
                          Rozet
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleClaimBonus(milestone.days)}
                    disabled={claiming === milestone.days}
                    className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {claiming === milestone.days ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Alınıyor...
                      </span>
                    ) : (
                      "🎁 Bonusu Al"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tüm Milestone'lar Tamamlandı */}
      {!nextMilestone && availableMilestones.length === 0 && streak >= 100 && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
          <div className="p-6 text-center">
            <div className="mb-4 text-6xl">👑</div>
            <h4 className="mb-2 text-xl font-bold text-yellow-900">
              Tüm Milestone'ları Tamamladın!
            </h4>
            <p className="text-sm text-gray-700">
              İnanılmaz bir başarı! {streak} gün streak'in var ve tüm bonusları
              aldın. Devam et! 🎉
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
