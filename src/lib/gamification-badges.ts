/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { checkAndAwardBadge } from "@/lib/gamification";

/**
 * Görev tamamlama rozetlerini kontrol eder
 * 10, 50, 100 görev tamamlama için rozetler verir
 */
export async function checkQuestBadges(userId: string) {
  const newBadges = [];

  // Tamamlanan görev sayısını al
  const completedQuestsCount = await prisma.userDailyQuest.count({
    where: {
      userId,
      completed: true,
    },
  });

  // 10 görev rozeti
  if (completedQuestsCount >= 10) {
    const badge = await checkAndAwardBadge(userId, "QUEST_MASTER_10");
    if (badge) newBadges.push(badge);
  }

  // 50 görev rozeti
  if (completedQuestsCount >= 50) {
    const badge = await checkAndAwardBadge(userId, "QUEST_MASTER_50");
    if (badge) newBadges.push(badge);
  }

  // 100 görev rozeti
  if (completedQuestsCount >= 100) {
    const badge = await checkAndAwardBadge(userId, "QUEST_MASTER_100");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

/**
 * Coin toplama rozetlerini kontrol eder
 * Toplam kazanılan coin miktarına göre rozetler verir
 */
export async function checkCoinBadges(userId: string) {
  const newBadges = [];

  // Toplam kazanılan coin miktarını hesapla
  const earnedCoins = await prisma.coinTransaction.aggregate({
    where: {
      userId,
      type: {
        in: ['EARN', 'EARNED', 'BONUS'],
      },
    },
    _sum: {
      amount: true,
    },
  });

  const totalEarned = earnedCoins._sum.amount || 0;

  // 1000 coin rozeti
  if (totalEarned >= 1000) {
    const badge = await checkAndAwardBadge(userId, "COIN_COLLECTOR_1000");
    if (badge) newBadges.push(badge);
  }

  // 5000 coin rozeti
  if (totalEarned >= 5000) {
    const badge = await checkAndAwardBadge(userId, "COIN_COLLECTOR_5000");
    if (badge) newBadges.push(badge);
  }

  // 10000 coin rozeti
  if (totalEarned >= 10000) {
    const badge = await checkAndAwardBadge(userId, "COIN_COLLECTOR_10000");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

/**
 * Oyun rozetlerini kontrol eder
 * Her oyun için yüksek skor hedeflerine ulaşıldığında rozetler verir
 */
export async function checkGameBadges(userId: string, gameType?: string) {
  const newBadges = [];

  // Kalori Tahmin Oyunu - 800+ puan
  if (!gameType || gameType === 'CALORIE_GUESS') {
    const calorieHighScore = await prisma.gameScore.findFirst({
      where: {
        userId,
        gameType: 'CALORIE_GUESS',
        score: {
          gte: 800,
        },
      },
      orderBy: {
        score: 'desc',
      },
    });

    if (calorieHighScore) {
      const badge = await checkAndAwardBadge(userId, "GAME_CALORIE_MASTER");
      if (badge) newBadges.push(badge);
    }
  }

  // Hafıza Kartları Oyunu - 20 hamle altında (skor sistemi: 100 - hamle sayısı)
  // 20 hamle = 80 puan, bu yüzden 80+ puan arıyoruz
  if (!gameType || gameType === 'MEMORY_CARDS') {
    const memoryHighScore = await prisma.gameScore.findFirst({
      where: {
        userId,
        gameType: 'MEMORY_CARDS',
        score: {
          gte: 80,
        },
      },
      orderBy: {
        score: 'desc',
      },
    });

    if (memoryHighScore) {
      const badge = await checkAndAwardBadge(userId, "GAME_MEMORY_MASTER");
      if (badge) newBadges.push(badge);
    }
  }

  // Hızlı Tıklama Oyunu - 300+ puan
  if (!gameType || gameType === 'QUICK_CLICK') {
    const quickClickHighScore = await prisma.gameScore.findFirst({
      where: {
        userId,
        gameType: 'QUICK_CLICK',
        score: {
          gte: 300,
        },
      },
      orderBy: {
        score: 'desc',
      },
    });

    if (quickClickHighScore) {
      const badge = await checkAndAwardBadge(userId, "GAME_QUICK_CLICK_MASTER");
      if (badge) newBadges.push(badge);
    }
  }

  return newBadges;
}

/**
 * Mağaza rozetlerini kontrol eder
 * İlk satın alma ve 10 ödül satın alma için rozetler verir
 */
export async function checkShopBadges(userId: string) {
  const newBadges = [];

  // Satın alınan ödül sayısını al
  const purchasedRewardsCount = await prisma.userReward.count({
    where: {
      userId,
    },
  });

  // İlk satın alma rozeti
  if (purchasedRewardsCount >= 1) {
    const badge = await checkAndAwardBadge(userId, "SHOP_FIRST_PURCHASE");
    if (badge) newBadges.push(badge);
  }

  // 10 ödül satın alma rozeti
  if (purchasedRewardsCount >= 10) {
    const badge = await checkAndAwardBadge(userId, "SHOP_ENTHUSIAST_10");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

/**
 * Tüm gamification rozetlerini kontrol eder
 * Görev, coin, oyun ve mağaza rozetlerini tek seferde kontrol eder
 */
export async function checkAllGamificationBadges(userId: string) {
  const allNewBadges = [];

  try {
    const questBadges = await checkQuestBadges(userId);
    allNewBadges.push(...questBadges);

    const coinBadges = await checkCoinBadges(userId);
    allNewBadges.push(...coinBadges);

    const gameBadges = await checkGameBadges(userId);
    allNewBadges.push(...gameBadges);

    const shopBadges = await checkShopBadges(userId);
    allNewBadges.push(...shopBadges);
  } catch (error) {
    console.error('Error checking gamification badges:', error);
  }

  return allNewBadges;
}
