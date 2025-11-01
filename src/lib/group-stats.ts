import { prisma } from '@/lib/prisma';
import { getCachedData, deleteFromCache } from '@/lib/memory-cache';
import { CACHE_TIMES } from '@/lib/cache';

/**
 * Grup istatistiklerini hesaplayan fonksiyonlar
 */

interface GroupStatsData {
  totalMembers: number;
  activeMembers: number;
  totalWeightLoss: number;
  avgWeightLoss: number;
  totalPosts: number;
  totalMessages: number;
  activeRate: number;
}

/**
 * Toplam üye sayısını hesaplar
 */
export async function calculateTotalMembers(groupId: string): Promise<number> {
  const count = await prisma.groupMember.count({
    where: {
      groupId,
    },
  });
  return count;
}

/**
 * Aktif üye sayısını hesaplar (son 7 gün içinde aktivite gösterenler)
 */
export async function calculateActiveMembers(groupId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const count = await prisma.groupMember.count({
    where: {
      groupId,
      lastActiveAt: {
        gte: sevenDaysAgo,
      },
    },
  });
  return count;
}

/**
 * Toplam kilo kaybını hesaplar (tüm üyelerin kilo kayıpları toplamı)
 */
export async function calculateTotalWeightLoss(groupId: string): Promise<number> {
  const members = await prisma.groupMember.findMany({
    where: {
      groupId,
    },
    include: {
      user: {
        include: {
          weightLogs: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      },
    },
  });

  let totalWeightLoss = 0;

  for (const member of members) {
    const weightLogs = member.user.weightLogs;
    if (weightLogs.length >= 2) {
      const firstWeight = weightLogs[0].weight;
      const lastWeight = weightLogs[weightLogs.length - 1].weight;
      const weightLoss = firstWeight - lastWeight;
      if (weightLoss > 0) {
        totalWeightLoss += weightLoss;
      }
    }
  }

  return Math.round(totalWeightLoss * 10) / 10; // 1 ondalık basamak
}

/**
 * Ortalama kilo kaybını hesaplar
 */
export async function calculateAverageWeightLoss(groupId: string): Promise<number> {
  const members = await prisma.groupMember.findMany({
    where: {
      groupId,
    },
    include: {
      user: {
        include: {
          weightLogs: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      },
    },
  });

  let totalWeightLoss = 0;
  let membersWithWeightLoss = 0;

  for (const member of members) {
    const weightLogs = member.user.weightLogs;
    if (weightLogs.length >= 2) {
      const firstWeight = weightLogs[0].weight;
      const lastWeight = weightLogs[weightLogs.length - 1].weight;
      const weightLoss = firstWeight - lastWeight;
      if (weightLoss > 0) {
        totalWeightLoss += weightLoss;
        membersWithWeightLoss++;
      }
    }
  }

  if (membersWithWeightLoss === 0) return 0;

  return Math.round((totalWeightLoss / membersWithWeightLoss) * 10) / 10;
}

/**
 * Toplam gönderi sayısını hesaplar
 */
export async function calculateTotalPosts(groupId: string): Promise<number> {
  const count = await prisma.groupPost.count({
    where: {
      groupId,
    },
  });
  return count;
}

/**
 * Toplam mesaj sayısını hesaplar
 */
export async function calculateTotalMessages(groupId: string): Promise<number> {
  const count = await prisma.groupMessage.count({
    where: {
      groupId,
    },
  });
  return count;
}

/**
 * Aktif üye oranını hesaplar (yüzde olarak)
 */
export async function calculateActiveRate(groupId: string): Promise<number> {
  const totalMembers = await calculateTotalMembers(groupId);
  if (totalMembers === 0) return 0;

  const activeMembers = await calculateActiveMembers(groupId);
  const rate = (activeMembers / totalMembers) * 100;

  return Math.round(rate * 10) / 10; // 1 ondalık basamak
}

/**
 * Tüm grup istatistiklerini hesaplar ve döndürür
 */
export async function calculateGroupStats(groupId: string): Promise<GroupStatsData> {
  const [
    totalMembers,
    activeMembers,
    totalWeightLoss,
    avgWeightLoss,
    totalPosts,
    totalMessages,
    activeRate,
  ] = await Promise.all([
    calculateTotalMembers(groupId),
    calculateActiveMembers(groupId),
    calculateTotalWeightLoss(groupId),
    calculateAverageWeightLoss(groupId),
    calculateTotalPosts(groupId),
    calculateTotalMessages(groupId),
    calculateActiveRate(groupId),
  ]);

  return {
    totalMembers,
    activeMembers,
    totalWeightLoss,
    avgWeightLoss,
    totalPosts,
    totalMessages,
    activeRate,
  };
}

/**
 * Tüm grup istatistiklerini cache ile getirir
 */
export async function getGroupStatsWithCache(groupId: string): Promise<GroupStatsData> {
  const cacheKey = `group-stats:${groupId}`;
  
  return getCachedData(
    cacheKey,
    () => calculateGroupStats(groupId),
    CACHE_TIMES.GROUP_STATS
  );
}

/**
 * Grup istatistikleri cache'ini temizler
 */
export function invalidateGroupStatsCache(groupId: string): void {
  const cacheKey = `group-stats:${groupId}`;
  deleteFromCache(cacheKey);
}

/**
 * Grup istatistiklerini veritabanına kaydeder veya günceller
 */
export async function saveGroupStats(groupId: string): Promise<void> {
  const stats = await calculateGroupStats(groupId);

  await prisma.groupStats.upsert({
    where: {
      groupId,
    },
    create: {
      groupId,
      ...stats,
    },
    update: {
      ...stats,
    },
  });
}

/**
 * Grup istatistiklerini geçmişe kaydeder (günlük snapshot)
 */
export async function saveGroupStatsHistory(groupId: string): Promise<void> {
  const stats = await calculateGroupStats(groupId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.groupStatsHistory.upsert({
    where: {
      groupId_date: {
        groupId,
        date: today,
      },
    },
    create: {
      groupId,
      date: today,
      activeMembers: stats.activeMembers,
      totalWeightLoss: stats.totalWeightLoss,
      postsCount: stats.totalPosts,
      messagesCount: stats.totalMessages,
    },
    update: {
      activeMembers: stats.activeMembers,
      totalWeightLoss: stats.totalWeightLoss,
      postsCount: stats.totalPosts,
      messagesCount: stats.totalMessages,
    },
  });
}

/**
 * Belirli bir tarih aralığındaki grup istatistiklerini getirir
 */
export async function getGroupStatsHistory(
  groupId: string,
  startDate: Date,
  endDate: Date
) {
  const history = await prisma.groupStatsHistory.findMany({
    where: {
      groupId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  return history;
}

/**
 * Son N günün istatistiklerini getirir
 */
export async function getRecentStatsHistory(groupId: string, days: number = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return getGroupStatsHistory(groupId, startDate, endDate);
}
