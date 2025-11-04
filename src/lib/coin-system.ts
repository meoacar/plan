import { prisma } from '@/lib/prisma';
import { CoinTransactionType } from '@prisma/client';
import { notifyCoinEarned } from '@/lib/notification-service';

/**
 * Coin Sistemi - Backend Altyapısı
 * 
 * Bu modül sanal para (coin) sisteminin yönetimini sağlar.
 * Coin ekleme, harcama, işlem geçmişi kaydetme ve bakiye kontrolü işlemlerini içerir.
 */

// Coin kaynakları
export const COIN_SOURCES = {
  // Görevler
  QUEST_DAILY: 'QUEST_DAILY',
  QUEST_WEEKLY: 'QUEST_WEEKLY',
  QUEST_SPECIAL: 'QUEST_SPECIAL',
  
  // Mini Oyunlar
  GAME_CALORIE_GUESS: 'GAME_CALORIE_GUESS',
  GAME_MEMORY_CARDS: 'GAME_MEMORY_CARDS',
  GAME_QUICK_CLICK: 'GAME_QUICK_CLICK',
  
  // Streak ve Bonuslar
  STREAK_BONUS: 'STREAK_BONUS',
  DAILY_LOGIN: 'DAILY_LOGIN',
  LEVEL_UP: 'LEVEL_UP',
  
  // Mağaza
  PURCHASE_REWARD: 'PURCHASE_REWARD',
  REFUND: 'REFUND',
  
  // Admin
  ADMIN_GRANT: 'ADMIN_GRANT',
  ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT',
} as const;

// Coin harcama nedenleri
export const COIN_SPEND_REASONS = {
  REWARD_PURCHASE: 'REWARD_PURCHASE',
  PREMIUM_FEATURE: 'PREMIUM_FEATURE',
  CUSTOMIZATION: 'CUSTOMIZATION',
  ADMIN_DEDUCTION: 'ADMIN_DEDUCTION',
} as const;

/**
 * Kullanıcıya coin ekler
 * 
 * @param userId - Kullanıcı ID
 * @param amount - Eklenecek coin miktarı (pozitif sayı)
 * @param reason - Coin kazanma nedeni
 * @param metadata - Ek bilgiler (opsiyonel)
 * @returns Güncellenmiş kullanıcı ve işlem kaydı
 */
export async function addCoins(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
) {
  try {
    // Miktar kontrolü
    if (amount <= 0) {
      throw new Error('Coin miktarı pozitif olmalıdır');
    }

    // Transaction ile coin ekle ve işlem kaydı oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Kullanıcının coin bakiyesini artır
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: amount,
          },
        },
        select: {
          id: true,
          coins: true,
          name: true,
        },
      });

      // İşlem kaydı oluştur
      const transaction = await tx.coinTransaction.create({
        data: {
          userId,
          amount,
          type: CoinTransactionType.EARNED,
          reason,
          metadata: metadata || {},
        },
      });

      return {
        user: updatedUser,
        transaction,
      };
    });

    console.log(
      `Coin eklendi: ${amount} coin - Kullanıcı: ${userId} - Neden: ${reason}`
    );

    // Coin rozetlerini kontrol et
    try {
      const { checkCoinBadges } = await import('./gamification-badges');
      await checkCoinBadges(userId);
    } catch (badgeError) {
      console.error('Coin rozet kontrolü hatası:', badgeError);
      // Rozet hatası coin kazanımını etkilemez
    }

    return result;
  } catch (error) {
    console.error('Coin ekleme hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının coinlerini harcar
 * 
 * @param userId - Kullanıcı ID
 * @param amount - Harcanacak coin miktarı (pozitif sayı)
 * @param reason - Coin harcama nedeni
 * @param metadata - Ek bilgiler (opsiyonel)
 * @returns Güncellenmiş kullanıcı ve işlem kaydı
 */
export async function spendCoins(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
) {
  try {
    // Miktar kontrolü
    if (amount <= 0) {
      throw new Error('Coin miktarı pozitif olmalıdır');
    }

    // Bakiye kontrolü
    const hasEnough = await checkBalance(userId, amount);
    if (!hasEnough) {
      throw new Error('Yetersiz coin bakiyesi');
    }

    // Transaction ile coin harca ve işlem kaydı oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Kullanıcının coin bakiyesini azalt
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: {
            decrement: amount,
          },
        },
        select: {
          id: true,
          coins: true,
          name: true,
        },
      });

      // İşlem kaydı oluştur (negatif miktar)
      const transaction = await tx.coinTransaction.create({
        data: {
          userId,
          amount: -amount, // Negatif olarak kaydet
          type: CoinTransactionType.SPENT,
          reason,
          metadata: metadata || {},
        },
      });

      return {
        user: updatedUser,
        transaction,
      };
    });

    console.log(
      `Coin harcandı: ${amount} coin - Kullanıcı: ${userId} - Neden: ${reason}`
    );

    return result;
  } catch (error) {
    console.error('Coin harcama hatası:', error);
    throw error;
  }
}

/**
 * Coin işlem geçmişi kaydeder
 * 
 * @param userId - Kullanıcı ID
 * @param amount - İşlem miktarı (pozitif veya negatif)
 * @param type - İşlem tipi (EARN, SPEND, BONUS, REFUND)
 * @param reason - İşlem nedeni
 * @param metadata - Ek bilgiler (opsiyonel)
 * @returns Oluşturulan işlem kaydı
 */
export async function logCoinTransaction(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  reason: string,
  metadata?: Record<string, any>
) {
  try {
    const transaction = await prisma.coinTransaction.create({
      data: {
        userId,
        amount,
        type,
        reason,
        metadata: metadata || {},
      },
    });

    console.log(
      `Coin işlemi kaydedildi: ${amount} coin - Tip: ${type} - Kullanıcı: ${userId}`
    );

    return transaction;
  } catch (error) {
    console.error('Coin işlem kaydı oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının coin bakiyesini kontrol eder
 * 
 * @param userId - Kullanıcı ID
 * @param requiredAmount - Gerekli coin miktarı (opsiyonel)
 * @returns Yeterli bakiye varsa true, yoksa false
 */
export async function checkBalance(
  userId: string,
  requiredAmount?: number
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        coins: true,
      },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const currentBalance = user.coins || 0;

    // Eğer gerekli miktar belirtilmişse kontrol et
    if (requiredAmount !== undefined) {
      return currentBalance >= requiredAmount;
    }

    // Sadece bakiye kontrolü
    return currentBalance > 0;
  } catch (error) {
    console.error('Bakiye kontrolü hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının mevcut coin bakiyesini getirir
 * 
 * @param userId - Kullanıcı ID
 * @returns Coin bakiyesi
 */
export async function getBalance(userId: string): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        coins: true,
      },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return user.coins || 0;
  } catch (error) {
    console.error('Bakiye getirme hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının coin işlem geçmişini getirir
 * 
 * @param userId - Kullanıcı ID
 * @param options - Filtreleme ve sayfalama seçenekleri
 * @returns İşlem geçmişi ve toplam sayı
 */
export async function getTransactionHistory(
  userId: string,
  options?: {
    type?: CoinTransactionType;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    const {
      type,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
    } = options || {};

    // Filtre oluştur
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    // İşlemleri getir
    const [transactions, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.coinTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('İşlem geçmişi getirme hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının coin istatistiklerini getirir
 * 
 * @param userId - Kullanıcı ID
 * @param period - İstatistik periyodu ('daily', 'weekly', 'monthly', 'all')
 * @returns Kazanılan ve harcanan coin istatistikleri
 */
export async function getCoinStats(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all'
) {
  try {
    // Tarih aralığını belirle
    const now = new Date();
    let startDate: Date | undefined;

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
      default:
        startDate = undefined;
        break;
    }

    // Filtre oluştur
    const where: any = { userId };
    if (startDate) {
      where.createdAt = { gte: startDate };
    }

    // İşlemleri getir
    const transactions = await prisma.coinTransaction.findMany({
      where,
      select: {
        amount: true,
        type: true,
      },
    });

    // İstatistikleri hesapla
    const earned = transactions
      .filter((t) => t.type === CoinTransactionType.EARNED || t.type === CoinTransactionType.BONUS)
      .reduce((sum, t) => sum + t.amount, 0);

    const spent = Math.abs(
      transactions
        .filter((t) => t.type === CoinTransactionType.SPENT)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const refunded = transactions
      .filter((t) => t.type === CoinTransactionType.REFUND)
      .reduce((sum, t) => sum + t.amount, 0);

    // Mevcut bakiye
    const currentBalance = await getBalance(userId);

    return {
      period,
      earned,
      spent,
      refunded,
      net: earned - spent + refunded,
      currentBalance,
      transactionCount: transactions.length,
    };
  } catch (error) {
    console.error('Coin istatistikleri getirme hatası:', error);
    throw error;
  }
}

/**
 * Bonus coin verir
 * 
 * @param userId - Kullanıcı ID
 * @param amount - Bonus coin miktarı
 * @param reason - Bonus nedeni
 * @param metadata - Ek bilgiler (opsiyonel)
 * @returns Güncellenmiş kullanıcı ve işlem kaydı
 */
export async function grantBonusCoins(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
) {
  try {
    if (amount <= 0) {
      throw new Error('Bonus miktarı pozitif olmalıdır');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: amount,
          },
        },
        select: {
          id: true,
          coins: true,
          name: true,
        },
      });

      const transaction = await tx.coinTransaction.create({
        data: {
          userId,
          amount,
          type: CoinTransactionType.BONUS,
          reason,
          metadata: metadata || {},
        },
      });

      return {
        user: updatedUser,
        transaction,
      };
    });

    console.log(
      `Bonus coin verildi: ${amount} coin - Kullanıcı: ${userId} - Neden: ${reason}`
    );

    // Bonus coin bildirimi gönder (sadece büyük bonuslar için)
    if (amount >= 50) {
      try {
        await notifyCoinEarned(userId, amount, 'BONUS', reason);
      } catch (notifError) {
        console.error('Bonus coin bildirimi gönderme hatası:', notifError);
        // Bildirim hatası işlemi etkilemez
      }
    }

    return result;
  } catch (error) {
    console.error('Bonus coin verme hatası:', error);
    throw error;
  }
}

/**
 * Coin iadesi yapar
 * 
 * @param userId - Kullanıcı ID
 * @param amount - İade edilecek coin miktarı
 * @param reason - İade nedeni
 * @param metadata - Ek bilgiler (opsiyonel)
 * @returns Güncellenmiş kullanıcı ve işlem kaydı
 */
export async function refundCoins(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
) {
  try {
    if (amount <= 0) {
      throw new Error('İade miktarı pozitif olmalıdır');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: amount,
          },
        },
        select: {
          id: true,
          coins: true,
          name: true,
        },
      });

      const transaction = await tx.coinTransaction.create({
        data: {
          userId,
          amount,
          type: CoinTransactionType.REFUND,
          reason,
          metadata: metadata || {},
        },
      });

      return {
        user: updatedUser,
        transaction,
      };
    });

    console.log(
      `Coin iadesi yapıldı: ${amount} coin - Kullanıcı: ${userId} - Neden: ${reason}`
    );

    return result;
  } catch (error) {
    console.error('Coin iadesi hatası:', error);
    throw error;
  }
}

/**
 * Toplu coin işlemi yapar (birden fazla kullanıcıya)
 * 
 * @param operations - İşlem listesi
 * @returns Başarılı ve başarısız işlem sayıları
 */
export async function bulkCoinOperation(
  operations: Array<{
    userId: string;
    amount: number;
    type: 'add' | 'spend' | 'bonus';
    reason: string;
    metadata?: Record<string, any>;
  }>
) {
  try {
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    for (const op of operations) {
      try {
        switch (op.type) {
          case 'add':
            await addCoins(op.userId, op.amount, op.reason, op.metadata);
            break;
          case 'spend':
            await spendCoins(op.userId, op.amount, op.reason, op.metadata);
            break;
          case 'bonus':
            await grantBonusCoins(op.userId, op.amount, op.reason, op.metadata);
            break;
        }
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          userId: op.userId,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        });
      }
    }

    console.log(
      `Toplu coin işlemi tamamlandı. Başarılı: ${successCount}, Hata: ${errorCount}`
    );

    return {
      successCount,
      errorCount,
      total: operations.length,
      errors,
    };
  } catch (error) {
    console.error('Toplu coin işlemi hatası:', error);
    throw error;
  }
}
