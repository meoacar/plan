import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GamificationClient } from "./gamification-client";

export const metadata = {
  title: "Gamification - Zayıflama Planım",
  description: "Görevler, mağaza, oyunlar ve daha fazlası",
};

export default async function GamificationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Kullanıcı bilgilerini al
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      level: true,
      streak: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Coin bakiyesini al (eğer alan varsa)
  let coins = 0;
  try {
    const userWithCoins = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true },
    });
    coins = (userWithCoins as any)?.coins || 0;
  } catch (error) {
    // Coins alanı henüz yoksa 0 olarak devam et
    console.log('Coins field not yet available');
  }

  // Görevleri al (eğer tablo varsa)
  let dailyQuests: any[] = [];
  let weeklyQuests: any[] = [];
  let specialQuests: any[] = [];

  try {
    const userQuests = await (prisma as any).userQuest.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { expiresAt: { gte: new Date() } },
          { expiresAt: null },
        ],
      },
      include: {
        quest: true,
      },
      orderBy: [
        { completed: 'asc' },
        { quest: { priority: 'desc' } },
      ],
    });

    dailyQuests = userQuests.filter((uq: any) => uq.quest.type === 'DAILY');
    weeklyQuests = userQuests.filter((uq: any) => uq.quest.type === 'WEEKLY');
    specialQuests = userQuests.filter((uq: any) => uq.quest.type === 'SPECIAL');
  } catch (error) {
    console.log('Quest tables not yet available');
  }

  // Oyunları al (eğer tablo varsa)
  let games: any[] = [];
  try {
    games = await (prisma as any).miniGame.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  } catch (error) {
    console.log('MiniGame table not yet available');
  }

  // Bugünkü oyun sayılarını al
  const dailyPlays: Record<string, number> = {};
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gameSessions = await (prisma as any).gameSession.findMany({
      where: {
        userId: session.user.id,
        startedAt: { gte: today },
        completed: true,
      },
      select: {
        gameId: true,
      },
    });

    gameSessions.forEach((session: any) => {
      dailyPlays[session.gameId] = (dailyPlays[session.gameId] || 0) + 1;
    });
  } catch (error) {
    console.log('GameSession table not yet available');
  }

  // En yüksek skorları al
  const highScoreMap: Record<string, number> = {};
  try {
    const highScores = await (prisma as any).gameSession.findMany({
      where: {
        userId: session.user.id,
        completed: true,
      },
      select: {
        gameId: true,
        score: true,
      },
      orderBy: {
        score: 'desc',
      },
      distinct: ['gameId'],
    });

    highScores.forEach((hs: any) => {
      highScoreMap[hs.gameId] = hs.score;
    });
  } catch (error) {
    console.log('GameSession table not yet available');
  }

  // Streak bilgilerini al
  let streakBonuses: any[] = [];
  let availableMilestones: any[] = [];
  let nextMilestone: any = null;

  try {
    streakBonuses = await (prisma as any).streakBonus.findMany({
      orderBy: { streakDays: 'asc' },
    });

    // Kullanıcının alınabilir bonuslarını kontrol et
    const claimedBonuses = await (prisma as any).coinTransaction.findMany({
      where: {
        userId: session.user.id,
        type: 'BONUS',
        description: { contains: 'Streak' },
      },
      select: {
        metadata: true,
      },
    });

    const claimedStreakDays = new Set(
      claimedBonuses
        .map((ct: any) => ct.metadata?.streakDays)
        .filter(Boolean)
    );

    availableMilestones = streakBonuses.filter(
      (sb: any) => user.streak >= sb.streakDays && !claimedStreakDays.has(sb.streakDays)
    );

    nextMilestone = streakBonuses.find((sb: any) => sb.streakDays > user.streak);
  } catch (error) {
    console.log('StreakBonus table not yet available');
  }

  return (
    <GamificationClient
      user={{
        ...user,
        coins,
      }}
      quests={{
        daily: dailyQuests,
        weekly: weeklyQuests,
        special: specialQuests,
      }}
      games={games}
      dailyPlays={dailyPlays}
      highScores={highScoreMap}
      streak={{
        current: user.streak,
        nextMilestone: nextMilestone?.streakDays || 0,
        nextReward: nextMilestone || null,
        availableMilestones,
      }}
    />
  );
}
