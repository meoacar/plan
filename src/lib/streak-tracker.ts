import { prisma } from '@/lib/prisma';
import { checkStreakMilestone } from './streak-bonus';

/**
 * Streak Tracker
 * 
 * Kullanıcının günlük aktivitelerini takip eder ve streak'i günceller
 */

/**
 * Kullanıcının günlük aktivitesini kaydeder ve streak'i günceller
 * Bu fonksiyon check-in, plan oluşturma gibi aktivitelerde çağrılmalıdır
 */
export async function updateUserStreak(userId: string) {
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

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Kullanıcının son aktif olduğu gün
  const lastActive = user.lastActiveDate
    ? new Date(
        user.lastActiveDate.getFullYear(),
        user.lastActiveDate.getMonth(),
        user.lastActiveDate.getDate()
      )
    : null;

  let newStreak = user.streak;
  let shouldUpdate = false;

  if (!lastActive) {
    // İlk giriş
    newStreak = 1;
    shouldUpdate = true;
  } else {
    const daysDiff = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Bugün zaten aktif olmuş, streak değişmez
      return {
        streak: user.streak,
        updated: false,
        milestoneReached: false,
      };
    } else if (daysDiff === 1) {
      // Ardışık gün, streak artır
      newStreak = user.streak + 1;
      shouldUpdate = true;
    } else {
      // Streak kırıldı, sıfırla
      newStreak = 1;
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastActiveDate: now,
      },
    });

    // Milestone kontrolü
    const milestoneCheck = await checkStreakMilestone(userId, newStreak);
    const milestoneReached = milestoneCheck && !milestoneCheck.alreadyClaimed;

    return {
      streak: newStreak,
      updated: true,
      milestoneReached,
      milestone: milestoneReached ? milestoneCheck?.milestone : null,
    };
  }

  return {
    streak: user.streak,
    updated: false,
    milestoneReached: false,
  };
}

/**
 * Kullanıcının bugün aktif olup olmadığını kontrol eder
 */
export async function isUserActiveToday(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveDate: true },
  });

  if (!user || !user.lastActiveDate) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = new Date(
    user.lastActiveDate.getFullYear(),
    user.lastActiveDate.getMonth(),
    user.lastActiveDate.getDate()
  );

  return today.getTime() === lastActive.getTime();
}

/**
 * Kullanıcının streak'ini manuel olarak sıfırlar (admin için)
 */
export async function resetUserStreak(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: 0,
      lastActiveDate: null,
    },
  });

  return { success: true };
}
