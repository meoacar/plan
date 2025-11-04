import { prisma } from '@/lib/prisma';
import { RewardType } from '@prisma/client';
import { spendCoins, refundCoins } from './coin-system';
import { notifyRewardPurchased } from './notification-service';

/**
 * Ödül Mağazası Sistemi - Backend Altyapısı
 * 
 * Bu modül ödül mağazası sisteminin yönetimini sağlar.
 * Ödül satın alma, stok kontrolü, aktivasyon ve dijital ödül verme işlemlerini içerir.
 */

// Hata kodları
export const REWARD_ERROR_CODES = {
  REWARD_NOT_FOUND: 'REWARD_NOT_FOUND',
  REWARD_OUT_OF_STOCK: 'REWARD_OUT_OF_STOCK',
  REWARD_ALREADY_OWNED: 'REWARD_ALREADY_OWNED',
  INSUFFICIENT_COINS: 'INSUFFICIENT_COINS',
  REWARD_INACTIVE: 'REWARD_INACTIVE',
  INVALID_REWARD_TYPE: 'INVALID_REWARD_TYPE',
  ACTIVATION_FAILED: 'ACTIVATION_FAILED',
} as const;

// Hata mesajları
export const REWARD_ERROR_MESSAGES: Record<string, string> = {
  REWARD_NOT_FOUND: 'Ödül bulunamadı',
  REWARD_OUT_OF_STOCK: 'Ödül stokta yok',
  REWARD_ALREADY_OWNED: 'Bu ödüle zaten sahipsiniz',
  INSUFFICIENT_COINS: 'Yetersiz coin bakiyesi',
  REWARD_INACTIVE: 'Bu ödül şu anda aktif değil',
  INVALID_REWARD_TYPE: 'Geçersiz ödül tipi',
  ACTIVATION_FAILED: 'Ödül aktivasyonu başarısız oldu',
};

/**
 * Ödül satın alma fonksiyonu
 * 
 * @param userId - Kullanıcı ID
 * @param rewardId - Ödül ID
 * @returns Satın alınan ödül bilgisi ve güncellenmiş coin bakiyesi
 */
export async function purchaseReward(userId: string, rewardId: string) {
  try {
    // Ödülü getir
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    // Ödül kontrolü
    if (!reward) {
      throw new Error(REWARD_ERROR_MESSAGES.REWARD_NOT_FOUND);
    }

    if (!reward.isActive) {
      throw new Error(REWARD_ERROR_MESSAGES.REWARD_INACTIVE);
    }

    // Stok kontrolü
    const stockAvailable = await checkStock(rewardId);
    if (!stockAvailable) {
      throw new Error(REWARD_ERROR_MESSAGES.REWARD_OUT_OF_STOCK);
    }

    // Kullanıcının coin bakiyesini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user || user.coins < reward.price) {
      throw new Error(REWARD_ERROR_MESSAGES.INSUFFICIENT_COINS);
    }

    // Bazı ödül tipleri için tekrar satın alma kontrolü
    if (
      reward.type === RewardType.BADGE ||
      reward.type === RewardType.THEME ||
      reward.type === RewardType.AVATAR ||
      reward.type === RewardType.FRAME
    ) {
      const existingReward = await prisma.userReward.findFirst({
        where: {
          userId,
          rewardId,
        },
      });

      if (existingReward) {
        throw new Error(REWARD_ERROR_MESSAGES.REWARD_ALREADY_OWNED);
      }
    }

    // Transaction ile satın alma işlemi
    const result = await prisma.$transaction(async (tx) => {
      // Coin harcama
      await spendCoins(
        userId,
        reward.price,
        'REWARD_PURCHASE',
        {
          rewardId: reward.id,
          rewardName: reward.name,
          rewardType: reward.type,
        }
      );

      // Stok güncelleme (eğer stok takibi varsa)
      if (reward.stock !== null) {
        await tx.reward.update({
          where: { id: rewardId },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });
      }

      // UserReward kaydı oluştur
      const userReward = await tx.userReward.create({
        data: {
          userId,
          rewardId,
          coinsPaid: reward.price,
          rewardData: {},
        },
        include: {
          reward: true,
        },
      });

      // Dijital ödüller için otomatik aktivasyon
      if (
        reward.type === RewardType.BADGE ||
        reward.type === RewardType.THEME ||
        reward.type === RewardType.AVATAR ||
        reward.type === RewardType.FRAME
      ) {
        await grantDigitalReward(userId, userReward.id, reward.type, reward.digitalData);
      }

      // Fiziksel ödüller için kod oluştur
      if (
        reward.type === RewardType.DISCOUNT_CODE ||
        reward.type === RewardType.GIFT_CARD
      ) {
        const code = generateRewardCode(reward.type, reward.id);
        await tx.userReward.update({
          where: { id: userReward.id },
          data: {
            rewardData: {
              code,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      }

      // Premium özellikler için süre belirle
      if (
        reward.type === RewardType.AD_FREE ||
        reward.type === RewardType.PREMIUM_STATS ||
        reward.type === RewardType.CUSTOM_PROFILE
      ) {
        const premiumData = reward.premiumData as any;
        const duration = premiumData?.duration || 30; // Varsayılan 30 gün
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        await tx.userReward.update({
          where: { id: userReward.id },
          data: {
            expiresAt,
          },
        });
      }

      return userReward;
    });

    console.log(
      `Ödül satın alındı: ${reward.name} - Kullanıcı: ${userId} - Fiyat: ${reward.price} coin`
    );

    // Ödül satın alma bildirimi gönder
    try {
      await notifyRewardPurchased(userId, reward.name, reward.price, reward.id);
    } catch (notifError) {
      console.error('Ödül satın alma bildirimi gönderme hatası:', notifError);
      // Bildirim hatası satın alma işlemini etkilemez
    }

    // Mağaza rozetlerini kontrol et
    try {
      const { checkShopBadges } = await import('./gamification-badges');
      await checkShopBadges(userId);
    } catch (badgeError) {
      console.error('Mağaza rozet kontrolü hatası:', badgeError);
      // Rozet hatası satın alma işlemini etkilemez
    }

    // Güncellenmiş kullanıcı bilgisini getir
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    return {
      success: true,
      userReward: result,
      remainingCoins: updatedUser?.coins || 0,
    };
  } catch (error) {
    console.error('Ödül satın alma hatası:', error);
    throw error;
  }
}

/**
 * Stok kontrolü fonksiyonu
 * 
 * @param rewardId - Ödül ID
 * @returns Stok durumu (true = stokta var, false = stokta yok)
 */
export async function checkStock(rewardId: string): Promise<boolean> {
  try {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: {
        stock: true,
        isActive: true,
      },
    });

    if (!reward) {
      return false;
    }

    if (!reward.isActive) {
      return false;
    }

    // Stok null ise sınırsız stok var demektir
    if (reward.stock === null) {
      return true;
    }

    // Stok 0'dan büyükse stokta var
    return reward.stock > 0;
  } catch (error) {
    console.error('Stok kontrolü hatası:', error);
    return false;
  }
}

/**
 * Ödül aktivasyon fonksiyonu
 * 
 * @param userId - Kullanıcı ID
 * @param userRewardId - UserReward ID
 * @returns Aktivasyon sonucu
 */
export async function activateReward(userId: string, userRewardId: string) {
  try {
    // UserReward kaydını getir
    const userReward = await prisma.userReward.findUnique({
      where: { id: userRewardId },
      include: {
        reward: true,
      },
    });

    // Kontroller
    if (!userReward) {
      throw new Error('Ödül kaydı bulunamadı');
    }

    if (userReward.userId !== userId) {
      throw new Error('Bu ödül size ait değil');
    }

    if (userReward.isUsed) {
      throw new Error('Bu ödül zaten kullanılmış');
    }

    // Süre kontrolü (premium özellikler için)
    if (userReward.expiresAt && userReward.expiresAt < new Date()) {
      throw new Error('Bu ödülün süresi dolmuş');
    }

    const reward = userReward.reward;

    // Ödül tipine göre aktivasyon
    let activationResult: any = {};

    switch (reward.type) {
      case RewardType.BADGE:
        activationResult = await activateBadgeReward(userId, reward.digitalData);
        break;

      case RewardType.THEME:
        activationResult = await activateThemeReward(userId, reward.digitalData);
        break;

      case RewardType.AVATAR:
        activationResult = await activateAvatarReward(userId, reward.digitalData);
        break;

      case RewardType.FRAME:
        activationResult = await activateFrameReward(userId, reward.digitalData);
        break;

      case RewardType.AD_FREE:
      case RewardType.PREMIUM_STATS:
      case RewardType.CUSTOM_PROFILE:
        activationResult = await activatePremiumFeature(userId, reward.type, userReward.expiresAt);
        break;

      case RewardType.DISCOUNT_CODE:
      case RewardType.GIFT_CARD:
        // Fiziksel ödüller için aktivasyon gerekmez, sadece kodu göster
        activationResult = {
          message: 'Ödül kodunuz hazır',
          code: (userReward.rewardData as any)?.code,
        };
        break;

      default:
        throw new Error(REWARD_ERROR_MESSAGES.INVALID_REWARD_TYPE);
    }

    // UserReward'ı kullanılmış olarak işaretle
    await prisma.userReward.update({
      where: { id: userRewardId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    console.log(
      `Ödül aktifleştirildi: ${reward.name} - Kullanıcı: ${userId}`
    );

    return {
      success: true,
      message: 'Ödül başarıyla aktifleştirildi',
      ...activationResult,
    };
  } catch (error) {
    console.error('Ödül aktivasyon hatası:', error);
    throw error;
  }
}

/**
 * Dijital ödül verme fonksiyonu
 * 
 * @param userId - Kullanıcı ID
 * @param userRewardId - UserReward ID
 * @param rewardType - Ödül tipi
 * @param digitalData - Dijital ödül verisi
 * @returns Verilen ödül bilgisi
 */
export async function grantDigitalReward(
  userId: string,
  userRewardId: string,
  rewardType: RewardType,
  digitalData: any
) {
  try {
    let result: any = {};

    switch (rewardType) {
      case RewardType.BADGE:
        result = await grantBadge(userId, digitalData);
        break;

      case RewardType.THEME:
        result = await grantTheme(userId, digitalData);
        break;

      case RewardType.AVATAR:
        result = await grantAvatar(userId, digitalData);
        break;

      case RewardType.FRAME:
        result = await grantFrame(userId, digitalData);
        break;

      default:
        throw new Error(REWARD_ERROR_MESSAGES.INVALID_REWARD_TYPE);
    }

    // UserReward'ı otomatik olarak kullanılmış işaretle
    await prisma.userReward.update({
      where: { id: userRewardId },
      data: {
        isUsed: true,
        usedAt: new Date(),
        rewardData: result,
      },
    });

    console.log(
      `Dijital ödül verildi: ${rewardType} - Kullanıcı: ${userId}`
    );

    return result;
  } catch (error) {
    console.error('Dijital ödül verme hatası:', error);
    throw error;
  }
}

// Yardımcı fonksiyonlar

/**
 * Rozet ödülü verme
 */
async function grantBadge(userId: string, digitalData: any) {
  const badgeType = digitalData?.badgeType;
  
  if (!badgeType) {
    throw new Error('Rozet tipi belirtilmemiş');
  }

  // Rozet zaten var mı kontrol et
  const existingBadge = await prisma.userBadge.findFirst({
    where: {
      userId,
      badge: {
        type: badgeType,
      },
    },
  });

  if (existingBadge) {
    return {
      message: 'Bu rozete zaten sahipsiniz',
      badgeType,
    };
  }

  // Rozeti bul
  const badge = await prisma.badge.findUnique({
    where: { type: badgeType },
  });

  if (!badge) {
    throw new Error('Rozet bulunamadı');
  }

  // Rozeti kullanıcıya ver
  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
  });

  return {
    message: 'Rozet başarıyla verildi',
    badgeType,
    badgeName: badge.name,
  };
}

/**
 * Tema ödülü verme
 */
async function grantTheme(userId: string, digitalData: any) {
  const themeCode = digitalData?.themeCode;
  
  if (!themeCode) {
    throw new Error('Tema kodu belirtilmemiş');
  }

  // Kullanıcının profil ayarlarını güncelle
  // Not: Bu kısım mevcut profil sisteminize göre uyarlanmalı
  await prisma.user.update({
    where: { id: userId },
    data: {
      // Tema bilgisini metadata veya ayrı bir alan olarak saklayabilirsiniz
      // Örnek: metadata içinde themes array'i
    },
  });

  return {
    message: 'Tema başarıyla eklendi',
    themeCode,
  };
}

/**
 * Avatar ödülü verme
 */
async function grantAvatar(userId: string, digitalData: any) {
  const avatarUrl = digitalData?.avatarUrl;
  
  if (!avatarUrl) {
    throw new Error('Avatar URL belirtilmemiş');
  }

  // Avatar bilgisini kullanıcıya ekle
  // Not: Bu kısım mevcut avatar sisteminize göre uyarlanmalı
  
  return {
    message: 'Avatar başarıyla eklendi',
    avatarUrl,
  };
}

/**
 * Çerçeve ödülü verme
 */
async function grantFrame(userId: string, digitalData: any) {
  const frameCode = digitalData?.frameCode;
  
  if (!frameCode) {
    throw new Error('Çerçeve kodu belirtilmemiş');
  }

  // Çerçeve bilgisini kullanıcıya ekle
  // Not: Bu kısım mevcut profil sisteminize göre uyarlanmalı
  
  return {
    message: 'Çerçeve başarıyla eklendi',
    frameCode,
  };
}

/**
 * Rozet aktivasyonu
 */
async function activateBadgeReward(userId: string, digitalData: any) {
  return await grantBadge(userId, digitalData);
}

/**
 * Tema aktivasyonu
 */
async function activateThemeReward(userId: string, digitalData: any) {
  return await grantTheme(userId, digitalData);
}

/**
 * Avatar aktivasyonu
 */
async function activateAvatarReward(userId: string, digitalData: any) {
  return await grantAvatar(userId, digitalData);
}

/**
 * Çerçeve aktivasyonu
 */
async function activateFrameReward(userId: string, digitalData: any) {
  return await grantFrame(userId, digitalData);
}

/**
 * Premium özellik aktivasyonu
 */
async function activatePremiumFeature(
  userId: string,
  featureType: RewardType,
  expiresAt: Date | null
) {
  // Premium özellik bilgisini kullanıcıya ekle
  // Not: Bu kısım mevcut premium sistem yapınıza göre uyarlanmalı
  // Örneğin, User modelinde premiumFeatures JSON alanı olabilir
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Premium özelliği aktifleştir
  // Bu kısım projenizin yapısına göre özelleştirilmeli
  
  return {
    message: 'Premium özellik aktifleştirildi',
    featureType,
    expiresAt: expiresAt?.toISOString(),
  };
}

/**
 * Ödül kodu oluşturma
 */
function generateRewardCode(rewardType: RewardType, rewardId: string): string {
  const prefix = rewardType === RewardType.DISCOUNT_CODE ? 'DISC' : 'GIFT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const shortId = rewardId.substring(0, 4).toUpperCase();
  
  return `${prefix}-${shortId}-${timestamp}-${random}`;
}

/**
 * Kullanıcının ödüllerini getir
 */
export async function getUserRewards(
  userId: string,
  options?: {
    includeUsed?: boolean;
    includeExpired?: boolean;
    rewardType?: RewardType;
  }
) {
  try {
    const { includeUsed = true, includeExpired = true, rewardType } = options || {};

    const where: any = { userId };

    if (!includeUsed) {
      where.isUsed = false;
    }

    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    if (rewardType) {
      where.reward = {
        type: rewardType,
      };
    }

    const rewards = await prisma.userReward.findMany({
      where,
      include: {
        reward: true,
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    return rewards;
  } catch (error) {
    console.error('Kullanıcı ödüllerini getirme hatası:', error);
    throw error;
  }
}

/**
 * Ödül iadesi (refund)
 */
export async function refundReward(userId: string, userRewardId: string, reason: string) {
  try {
    const userReward = await prisma.userReward.findUnique({
      where: { id: userRewardId },
      include: {
        reward: true,
      },
    });

    if (!userReward) {
      throw new Error('Ödül kaydı bulunamadı');
    }

    if (userReward.userId !== userId) {
      throw new Error('Bu ödül size ait değil');
    }

    if (userReward.isUsed) {
      throw new Error('Kullanılmış ödüller iade edilemez');
    }

    // Transaction ile iade işlemi
    await prisma.$transaction(async (tx) => {
      // Coin iadesi
      await refundCoins(
        userId,
        userReward.coinsPaid,
        reason,
        {
          userRewardId,
          rewardId: userReward.rewardId,
          rewardName: userReward.reward.name,
        }
      );

      // Stok geri ekle (eğer stok takibi varsa)
      if (userReward.reward.stock !== null) {
        await tx.reward.update({
          where: { id: userReward.rewardId },
          data: {
            stock: {
              increment: 1,
            },
          },
        });
      }

      // UserReward kaydını sil
      await tx.userReward.delete({
        where: { id: userRewardId },
      });
    });

    console.log(
      `Ödül iadesi yapıldı: ${userReward.reward.name} - Kullanıcı: ${userId} - İade: ${userReward.coinsPaid} coin`
    );

    return {
      success: true,
      refundedCoins: userReward.coinsPaid,
      message: 'Ödül başarıyla iade edildi',
    };
  } catch (error) {
    console.error('Ödül iadesi hatası:', error);
    throw error;
  }
}

/**
 * Aktif premium özellikleri kontrol et
 */
export async function checkActivePremiumFeatures(userId: string) {
  try {
    const now = new Date();

    const activeFeatures = await prisma.userReward.findMany({
      where: {
        userId,
        isUsed: true,
        reward: {
          type: {
            in: [
              RewardType.AD_FREE,
              RewardType.PREMIUM_STATS,
              RewardType.CUSTOM_PROFILE,
            ],
          },
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      include: {
        reward: true,
      },
    });

    const features: Record<string, boolean> = {
      adFree: false,
      premiumStats: false,
      customProfile: false,
    };

    activeFeatures.forEach((userReward) => {
      switch (userReward.reward.type) {
        case RewardType.AD_FREE:
          features.adFree = true;
          break;
        case RewardType.PREMIUM_STATS:
          features.premiumStats = true;
          break;
        case RewardType.CUSTOM_PROFILE:
          features.customProfile = true;
          break;
      }
    });

    return features;
  } catch (error) {
    console.error('Premium özellik kontrolü hatası:', error);
    throw error;
  }
}

/**
 * Süresi dolan premium özellikleri temizle
 */
export async function cleanupExpiredPremiumFeatures() {
  try {
    const now = new Date();

    const expiredFeatures = await prisma.userReward.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
        reward: {
          type: {
            in: [
              RewardType.AD_FREE,
              RewardType.PREMIUM_STATS,
              RewardType.CUSTOM_PROFILE,
            ],
          },
        },
      },
    });

    console.log(`${expiredFeatures.length} adet süresi dolmuş premium özellik bulundu`);

    // Süresi dolan özellikleri işaretle veya temizle
    // Bu kısım iş mantığınıza göre özelleştirilebilir

    return {
      expiredCount: expiredFeatures.length,
      expiredFeatures,
    };
  } catch (error) {
    console.error('Süresi dolan özellik temizleme hatası:', error);
    throw error;
  }
}
