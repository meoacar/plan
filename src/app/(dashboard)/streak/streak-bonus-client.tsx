"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { toast } from "react-hot-toast";

interface StreakMilestone {
  days: number;
  coinReward: number;
  xpReward: number;
  badgeType?: string;
  description: string;
}

interface StreakBonusClientProps {
  initialStreak: number;
  initialNextMilestone: number;
  initialNextReward: StreakMilestone | null;
  initialAvailableMilestones: StreakMilestone[];
}

export function StreakBonusClient({
  initialStreak,
  initialNextMilestone,
  initialNextReward,
  initialAvailableMilestones,
}: StreakBonusClientProps) {
  const router = useRouter();
  const [availableMilestones, setAvailableMilestones] = useState(
    initialAvailableMilestones
  );

  const handleClaimBonus = async (streakDays: number) => {
    try {
      const response = await fetch("/api/streak/claim-bonus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streakDays }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bonus talep edilemedi");
      }

      // Başarılı mesaj
      toast.success(
        `🎉 ${data.data.coinReward} coin ve ${data.data.xpReward} XP kazandınız!`,
        {
          duration: 5000,
          icon: "🎁",
        }
      );

      // Rozet kazanıldıysa ekstra mesaj
      if (data.data.badge) {
        toast.success(`🏆 "${data.data.badge.name}" rozetini kazandınız!`, {
          duration: 5000,
        });
      }

      // Seviye atlandıysa
      if (data.data.leveledUp) {
        toast.success(`⬆️ Seviye ${data.data.level}'e yükseldiniz!`, {
          duration: 5000,
        });
      }

      // Alınan milestone'u listeden çıkar
      setAvailableMilestones((prev) =>
        prev.filter((m) => m.days !== streakDays)
      );

      // Sayfayı yenile
      router.refresh();
    } catch (error) {
      console.error("Bonus claim error:", error);
      toast.error(
        error instanceof Error ? error.message : "Bir hata oluştu",
        {
          duration: 4000,
        }
      );
    }
  };

  return (
    <StreakDisplay
      streak={initialStreak}
      nextMilestone={initialNextMilestone}
      nextReward={initialNextReward!}
      availableMilestones={availableMilestones}
      onClaimBonus={handleClaimBonus}
    />
  );
}
