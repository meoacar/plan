import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { xpForNextLevel } from "@/lib/gamification";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { LevelProgress } from "@/components/gamification/LevelProgress";
import { BadgeCard } from "@/components/gamification/BadgeCard";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";

export const metadata = {
  title: "Gamification - Zayıflama Planım",
  description: "Rozetler, seviyeler ve liderlik tablosu",
};

export default async function GamificationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      xp: true,
      level: true,
      streak: true,
      badges: {
        include: {
          badge: true,
        },
        orderBy: {
          earnedAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const allBadges = await prisma.badge.findMany({
    orderBy: {
      xpReward: "asc",
    },
  });

  const earnedBadgeIds = new Set(user.badges.map((ub) => ub.badge.id));

  const nextLevelXP = xpForNextLevel(user.level);
  const currentLevelXP = user.level > 1 ? xpForNextLevel(user.level - 1) : 0;
  const progressXP = user.xp - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const progress = (progressXP / requiredXP) * 100;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🎮 Gamification</h1>
        <p className="mt-2 text-gray-600">
          Rozetler kazan, seviye atla ve liderlik tablosunda yüksel!
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <LevelProgress
            level={user.level}
            xp={user.xp}
            progress={Math.min(100, Math.max(0, progress))}
          />
          <StreakCounter streak={user.streak} />
        </div>

        <div className="lg:col-span-2">
          <LeaderboardTable />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          🏅 Rozetlerim ({user.badges.length}/{allBadges.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user.badges.map((userBadge) => (
            <BadgeCard
              key={userBadge.id}
              badge={userBadge.badge}
              earned={true}
              earnedAt={userBadge.earnedAt}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          🎯 Tüm Rozetler
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allBadges
            .filter((badge) => !earnedBadgeIds.has(badge.id))
            .map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned={false} />
            ))}
        </div>
      </div>
    </div>
  );
}
