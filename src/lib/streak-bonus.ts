import { prisma } from '@/lib/prisma';
import { BadgeType } from '@prisma/client';
import { notifyStreakMilestone, notifyLevelUp } from './notification-service';

/**
 * Streak Bonus Sistemi
 * 
 * Bu modül kullanıcıların ardışık giriş günlerine göre bonus ödüller vermek için kullanılır.
 * Milestone'lar: 7, 30, 100 gün
 */

interface StreakMilestone {
  days: number;
  coinReward: number;
  xpReward: number;
  badgeType?: BadgeType;
  description: string;
}

// Streak milestone tanımları
const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 7,
    coinReward: 100,
    xpReward: 50,
    badgeType: BadgeType.ACTIVE_7_DAYS,
    description: '7 gün ardışık giriş bonusu',
  },
  {
    days: 30,
    coinReward: 500,
    xpReward: 200,
    badgeType: BadgeType.ACTIVE_30_DAYS,
    description: '30 gün ardışık giriş bonusu',
  },
  {
    days: 100,
    coinReward: 2000,
    xpReward: 1000,
    badgeType: BadgeType.ACTIVE_100_DAYS,
    description: '100 gün ardışık giriş bonusu',
  },
];

/**
 * Kullanıcının mevcut streak'ine göre ulaşabileceği bir sonraki milestone'u bulur
 */
export async function getNextMilestone(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true },
  });

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Kullanıcının henüz ulaşmadığı ilk milestone'u bul
  const nextMilestone = STREAK_MILESTONES.find(
    (milestone) => milestone.days > user.streak
  );

  return nextMilestone || null;
}

/**
 * Kullanıcının belirli bir streak milestone'una ulaşıp ulaşmadığını kontrol eder
 */
export async function checkStreakMilestone(userId: string, streakDays: number) {
  // Bu streak değeri için bir milestone var mı?
  const milestone = STREAK_MILESTONES.find((m) => m.days === streakDays);
  
  if (!milestone) {
    return null;
  }

  // Kullanıcı bu bonusu daha önce aldı mı?
  const userBonusClaimed = await checkIfBonusClaimed(userId, milestone.days);

  return {
    milestone,
    alreadyClaimed: userBonusClaimed,
  };
}

/**
 * Kullanıcının belirli bir streak bonusunu daha önce alıp almadığını kontrol eder
 */
async function checkIfBonusClaimed(userId: string, streakDays: number): Promise<boolean> {
  // Coin transaction geçmişinden kontrol et
  const transaction = await prisma.coinTransaction.findFirst({
    where: {
      userId,
      type: 'BONUS',
      reason: `Streak Bonus - ${streakDays} gün`,
    },
  });

  return !!transaction;
}

/**
 * Kullanıcıya streak bonusu verir (coin + XP + rozet)
 */
export async function grantStreakBonus(userId: string, streakDays: number) {
  const milestone = STREAK_MILESTONES.find((m) => m.days === streakDays);

  if (!milestone) {
    throw new Error('Geçersiz streak milestone');
  }

  // Kullanıcının mevcut streak'ini kontrol et
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, xp: true, level: true, coins: true },
  });

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Kullanıcının streak'i bu milestone'a ulaşmış mı?
  if (user.streak < streakDays) {
    throw new Error('Kullanıcı henüz bu milestone\'a ulaşmamış');
  }

  // Daha önce alınmış mı kontrol et
  const alreadyClaimed = await checkIfBonusClaimed(userId, streakDays);
  if (alreadyClaimed) {
    throw new Error('Bu bonus daha önce alınmış');
  }

  // Transaction ile tüm işlemleri gerçekleştir
  const result = await prisma.$transaction(async (tx) => {
    // 1. Coin ekle
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: { increment: milestone.coinReward },
        xp: { increment: milestone.xpReward },
      },
    });

    // 2. Coin transaction kaydı oluştur
    await tx.coinTransaction.create({
      data: {
        userId,
        amount: milestone.coinReward,
        type: 'BONUS',
        reason: `Streak Bonus - ${streakDays} gün`,
        metadata: {
          streakDays,
          xpReward: milestone.xpReward,
          badgeType: milestone.badgeType,
        },
      },
    });

    // 3. Rozet varsa ver
    let badge = null;
    if (milestone.badgeType) {
      // Rozet zaten var mı kontrol et
      const existingBadge = await tx.userBadge.findFirst({
        where: {
          userId,
          badge: {
            type: milestone.badgeType,
          },
        },
      });

      if (!existingBadge) {
        // Rozet tanımını bul
        const badgeDefinition = await tx.badge.findUnique({
          where: { type: milestone.badgeType },
        });

        if (badgeDefinition) {
          badge = await tx.userBadge.create({
            data: {
              userId,
              badgeId: badgeDefinition.id,
            },
            include: {
              Badge: true,
            },
          });
        }
      }
    }

    // 4. Seviye hesapla (XP artışından dolayı)
    const newLevel = calculateLevel(updatedUser.xp);
    let leveledUp = false;

    if (newLevel > user.level) {
      await tx.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
      leveledUp = true;
    }

    return {
      coins: updatedUser.coins,
      xp: updatedUser.xp,
      level: newLevel,
      leveledUp,
      badge,
      coinReward: milestone.coinReward,
      xpReward: milestone.xpReward,
    };
  });

  // Quest Integration: Streak milestone görevi güncelle
  try {
    const { onStreakMilestone } = await import('./quest-integration');
    await onStreakMilestone(userId, streakDays);
  } catch (questError) {
    console.error('Streak milestone quest integration error:', questError);
    // Quest hatası bonus vermeyi etkilemez
  }

  // Streak milestone bildirimi gönder
  try {
    await notifyStreakMilestone(
      userId,
      streakDays,
      milestone.coinReward,
      milestone.xpReward,
      result.badge?.Badge?.name
    );
  } catch (notifError) {
    console.error('Streak milestone bildirimi gönderme hatası:', notifError);
    // Bildirim hatası bonus vermeyi etkilemez
  }

  // Seviye atlama bildirimi gönder
  if (result.leveledUp) {
    try {
      await notifyLevelUp(userId, result.level, 0); // Streak bonusunda ekstra coin yok
    } catch (notifError) {
      console.error('Seviye atlama bildirimi gönderme hatası:', notifError);
      // Bildirim hatası bonus vermeyi etkilemez
    }
  }

  return result;
}

/**
 * XP'ye göre seviye hesaplar
 */
function calculateLevel(xp: number): number {
  // Her seviye için gereken XP: level * 100
  // Seviye 1: 0-99 XP
  // Seviye 2: 100-199 XP
  // Seviye 3: 200-299 XP
  return Math.floor(xp / 100) + 1;
}

/**
 * Kullanıcının streak durumunu ve bir sonraki milestone bilgisini getirir
 */
export async function getStreakStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streak: true,
      lastActiveDate: true,
    },
  });

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  const nextMilestone = await getNextMilestone(userId);

  // Kullanıcının geçmiş streak bonuslarını al
  const claimedBonuses = await prisma.coinTransaction.findMany({
    where: {
      userId,
      type: 'BONUS',
      reason: {
        startsWith: 'Streak Bonus',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Hangi milestone'lar alınmış?
  const claimedMilestones = STREAK_MILESTONES.filter((milestone) =>
    claimedBonuses.some((bonus) =>
      bonus.reason.includes(`${milestone.days} gün`)
    )
  );

  // Hangi milestone'lar alınabilir durumda?
  const availableMilestones = STREAK_MILESTONES.filter(
    (milestone) =>
      user.streak >= milestone.days &&
      !claimedMilestones.some((claimed) => claimed.days === milestone.days)
  );

  return {
    currentStreak: user.streak,
    lastActiveDate: user.lastActiveDate,
    nextMilestone,
    claimedMilestones,
    availableMilestones,
    allMilestones: STREAK_MILESTONES,
  };
}

/**
 * Kullanıcının streak geçmişini getirir (son 30 gün)
 */
export async function getStreakHistory(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // CheckIn kayıtlarından aktif günleri bul
  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Günlük bazda grupla
  const activeDays = checkIns.map((checkIn) => {
    const date = new Date(checkIn.createdAt);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
  });

  // Unique günler
  const uniqueActiveDays = [...new Set(activeDays)];

  return uniqueActiveDays;
}

/**
 * Tüm streak milestone'larını getirir
 */
export function getAllMilestones() {
  return STREAK_MILESTONES;
}
