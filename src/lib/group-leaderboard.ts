import { prisma } from '@/lib/prisma';
import { getCachedData, deleteFromCache, deleteCachePattern } from '@/lib/memory-cache';
import { CACHE_TIMES } from '@/lib/cache';

type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

/**
 * Aktivite skoru hesaplama
 * - Paylaşım: 10 puan
 * - Yorum: 5 puan
 * - Beğeni: 2 puan
 * - Mesaj: 1 puan
 */
export async function calculateActivityScore(
  userId: string,
  groupId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Paylaşımlar
  const posts = await prisma.groupPost.count({
    where: {
      userId,
      groupId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Yorumlar
  const comments = await prisma.groupPostComment.count({
    where: {
      userId,
      post: {
        groupId,
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Beğeniler
  const likes = await prisma.groupPostLike.count({
    where: {
      userId,
      post: {
        groupId,
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Mesajlar
  const messages = await prisma.groupMessage.count({
    where: {
      userId,
      groupId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return posts * 10 + comments * 5 + likes * 2 + messages * 1;
}

/**
 * Kilo kaybı skoru hesaplama
 * Haftalık kilo kaybı * 100
 */
export async function calculateWeightLossScore(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Başlangıç kilosu (dönem başından önceki en son kayıt)
  const startWeight = await prisma.weightLog.findFirst({
    where: {
      userId,
      createdAt: {
        lte: startDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      weight: true,
    },
  });

  // Bitiş kilosu (dönem içindeki en son kayıt)
  const endWeight = await prisma.weightLog.findFirst({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      weight: true,
    },
  });

  if (!startWeight || !endWeight) {
    return 0;
  }

  const weightLoss = startWeight.weight - endWeight.weight;
  
  // Sadece kilo kaybı varsa puan ver (kilo alımı negatif puan olmasın)
  return weightLoss > 0 ? weightLoss * 100 : 0;
}

/**
 * Streak skoru hesaplama
 * Günlük giriş streak'i * 5
 */
export async function calculateStreakScore(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Kullanıcının dönem içindeki aktif günlerini bul
  const activeDays = await prisma.activityLog.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  });

  // Ardışık günleri hesapla
  const dates = activeDays
    .map((day) => new Date(day.createdAt).toDateString())
    .sort();

  let currentStreak = 0;
  let maxStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of dates) {
    const currentDate = new Date(dateStr);

    if (!lastDate) {
      currentStreak = 1;
    } else {
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    lastDate = currentDate;
  }

  return maxStreak * 5;
}

/**
 * Toplam skor hesaplama
 * (Aktivite * 0.3) + (Kilo Kaybı * 0.5) + (Streak * 0.2)
 */
export function calculateTotalScore(
  activityScore: number,
  weightLossScore: number,
  streakScore: number
): number {
  return activityScore * 0.3 + weightLossScore * 0.5 + streakScore * 0.2;
}

/**
 * Dönem tarihlerini hesapla
 */
export function getPeriodDates(
  period: LeaderboardPeriod,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date } {
  const now = new Date(referenceDate);

  if (period === 'WEEKLY') {
    // Haftanın başı (Pazartesi)
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diff);
    startDate.setHours(0, 0, 0, 0);

    // Haftanın sonu (Pazar)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  } else if (period === 'MONTHLY') {
    // Ayın başı
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    // Ayın sonu
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  } else {
    // ALL_TIME
    const startDate = new Date(0); // Unix epoch
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }
}

/**
 * Tek bir kullanıcı için liderlik tablosu kaydı hesapla ve güncelle
 */
export async function calculateUserLeaderboard(
  userId: string,
  groupId: string,
  period: LeaderboardPeriod
): Promise<void> {
  const { startDate, endDate } = getPeriodDates(period);

  // Skorları hesapla
  const activityScore = await calculateActivityScore(
    userId,
    groupId,
    startDate,
    endDate
  );

  const weightLossScore = await calculateWeightLossScore(
    userId,
    startDate,
    endDate
  );

  const streakScore = await calculateStreakScore(userId, startDate, endDate);

  const totalScore = calculateTotalScore(
    activityScore,
    weightLossScore,
    streakScore
  );

  // Veritabanına kaydet veya güncelle
  await prisma.groupLeaderboard.upsert({
    where: {
      groupId_userId_period_periodStart: {
        groupId,
        userId,
        period,
        periodStart: startDate,
      },
    },
    create: {
      groupId,
      userId,
      period,
      periodStart: startDate,
      periodEnd: endDate,
      activityScore,
      weightLossScore,
      streakScore,
      totalScore,
    },
    update: {
      activityScore,
      weightLossScore,
      streakScore,
      totalScore,
      periodEnd: endDate,
    },
  });
}

/**
 * Grup için tüm üyelerin liderlik tablosunu hesapla
 */
export async function calculateGroupLeaderboard(
  groupId: string,
  period: LeaderboardPeriod
): Promise<void> {
  // Grup üyelerini al
  const members = await prisma.groupMember.findMany({
    where: {
      groupId,
    },
    select: {
      userId: true,
    },
  });

  // Her üye için hesapla
  for (const member of members) {
    await calculateUserLeaderboard(member.userId, groupId, period);
  }

  // Sıralamaları güncelle
  await updateLeaderboardRanks(groupId, period);
}

/**
 * Liderlik tablosu sıralamalarını güncelle
 */
export async function updateLeaderboardRanks(
  groupId: string,
  period: LeaderboardPeriod
): Promise<void> {
  const { startDate } = getPeriodDates(period);

  // Toplam skora göre sıralı kayıtları al
  const leaderboard = await prisma.groupLeaderboard.findMany({
    where: {
      groupId,
      period,
      periodStart: startDate,
    },
    orderBy: {
      totalScore: 'desc',
    },
    select: {
      id: true,
    },
  });

  // Sıralamaları güncelle
  for (let i = 0; i < leaderboard.length; i++) {
    await prisma.groupLeaderboard.update({
      where: {
        id: leaderboard[i].id,
      },
      data: {
        rank: i + 1,
      },
    });
  }
}

/**
 * Liderlik tablosunu getir
 */
export async function getLeaderboard(
  groupId: string,
  period: LeaderboardPeriod,
  limit: number = 50
) {
  const { startDate } = getPeriodDates(period);

  return await prisma.groupLeaderboard.findMany({
    where: {
      groupId,
      period,
      periodStart: startDate,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
    },
    orderBy: {
      totalScore: 'desc',
    },
    take: limit,
  });
}

/**
 * Liderlik tablosunu cache ile getir
 */
export async function getLeaderboardWithCache(
  groupId: string,
  period: LeaderboardPeriod,
  limit: number = 50
) {
  const cacheKey = `group-leaderboard:${groupId}:${period}:${limit}`;
  
  return getCachedData(
    cacheKey,
    () => getLeaderboard(groupId, period, limit),
    CACHE_TIMES.GROUP_LEADERBOARD
  );
}

/**
 * Liderlik tablosu cache'ini temizler
 */
export function invalidateLeaderboardCache(groupId: string, period?: LeaderboardPeriod): void {
  if (period) {
    deleteCachePattern(`group-leaderboard:${groupId}:${period}:*`);
  } else {
    deleteCachePattern(`group-leaderboard:${groupId}:*`);
  }
}

/**
 * Kullanıcının liderlik tablosundaki konumunu getir
 */
export async function getUserLeaderboardPosition(
  userId: string,
  groupId: string,
  period: LeaderboardPeriod
) {
  const { startDate } = getPeriodDates(period);

  return await prisma.groupLeaderboard.findUnique({
    where: {
      groupId_userId_period_periodStart: {
        groupId,
        userId,
        period,
        periodStart: startDate,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
    },
  });
}
