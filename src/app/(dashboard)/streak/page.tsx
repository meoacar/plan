import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStreakStatus, getStreakHistory } from "@/lib/streak-bonus";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { StreakCalendar } from "@/components/streak/StreakCalendar";
import { StreakBonusClient } from "./streak-bonus-client";

export const metadata: Metadata = {
  title: "Streak - Ardışık Giriş | Zayıflama Planım",
  description:
    "Ardışık giriş günlerinizi takip edin ve özel bonuslar kazanın.",
};

export default async function StreakPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/giris");
  }

  // Streak durumunu al
  const streakStatus = await getStreakStatus(session.user.id);
  const streakHistory = await getStreakHistory(session.user.id);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🔥 Streak - Ardışık Giriş
        </h1>
        <p className="text-gray-600">
          Her gün giriş yaparak streak'ini artır ve özel bonuslar kazan!
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sol Kolon - Streak Display */}
        <div className="space-y-6">
          <StreakBonusClient
            initialStreak={streakStatus.currentStreak}
            initialNextMilestone={streakStatus.nextMilestone?.days || 0}
            initialNextReward={streakStatus.nextMilestone || null}
            initialAvailableMilestones={streakStatus.availableMilestones}
          />
        </div>

        {/* Sağ Kolon - Takvim */}
        <div>
          <StreakCalendar
            userId={session.user.id}
            activeDays={streakHistory}
            currentStreak={streakStatus.currentStreak}
          />
        </div>
      </div>

      {/* Bilgilendirme */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-blue-900">
          💡 Streak Nasıl Çalışır?
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            • Her gün platforma giriş yaparak streak'inizi artırabilirsiniz.
          </p>
          <p>
            • Belirli milestone'lara ulaştığınızda (7, 30, 100 gün) özel
            bonuslar kazanırsınız.
          </p>
          <p>
            • Bonuslar coin, XP ve özel rozetler içerir.
          </p>
          <p>
            • Bir gün giriş yapmazsanız streak'iniz sıfırlanır.
          </p>
          <p>
            • Takvimde yeşil günler aktif olduğunuz günleri gösterir.
          </p>
        </div>
      </div>

      {/* Tüm Milestone'lar */}
      <div className="mt-8">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          🏆 Tüm Milestone'lar
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {streakStatus.allMilestones.map((milestone) => {
            const isClaimed = streakStatus.claimedMilestones.some(
              (claimed) => claimed.days === milestone.days
            );
            const isAvailable = streakStatus.availableMilestones.some(
              (available) => available.days === milestone.days
            );
            const isLocked =
              streakStatus.currentStreak < milestone.days && !isClaimed;

            return (
              <div
                key={milestone.days}
                className={`rounded-lg border-2 p-4 ${
                  isClaimed
                    ? "border-green-300 bg-green-50"
                    : isAvailable
                      ? "border-yellow-300 bg-yellow-50"
                      : isLocked
                        ? "border-gray-200 bg-gray-50"
                        : "border-blue-300 bg-blue-50"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {milestone.days} Gün
                  </span>
                  {isClaimed && <span className="text-2xl">✅</span>}
                  {isAvailable && <span className="text-2xl">🎁</span>}
                  {isLocked && <span className="text-2xl">🔒</span>}
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-700">
                    {milestone.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                      {milestone.coinReward} Coin
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {milestone.xpReward} XP
                    </span>
                    {milestone.badgeType && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                        Rozet
                      </span>
                    )}
                  </div>
                </div>
                {isClaimed && (
                  <p className="mt-2 text-xs font-medium text-green-700">
                    ✓ Alındı
                  </p>
                )}
                {isAvailable && (
                  <p className="mt-2 text-xs font-medium text-yellow-700">
                    ⚡ Alınabilir
                  </p>
                )}
                {isLocked && (
                  <p className="mt-2 text-xs text-gray-600">
                    {milestone.days - streakStatus.currentStreak} gün kaldı
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
