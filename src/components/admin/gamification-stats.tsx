"use client";

interface GamificationStatsProps {
  totalXP: number;
  totalBadges: number;
  averageLevel: number;
  activeStreaks: number;
}

export function GamificationStats({
  totalXP,
  totalBadges,
  averageLevel,
  activeStreaks,
}: GamificationStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Toplam XP</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalXP.toLocaleString()}
            </p>
          </div>
          <div className="text-4xl">⭐</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Kazanılan Rozetler</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {totalBadges}
            </p>
          </div>
          <div className="text-4xl">🏅</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ortalama Seviye</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {averageLevel.toFixed(1)}
            </p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Aktif Streak</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {activeStreaks}
            </p>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
      </div>
    </div>
  );
}
