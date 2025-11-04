/**
 * Quest Integration Module
 * 
 * Bu modül mevcut sistemdeki aktiviteleri görev sistemi ile entegre eder.
 * Plan oluşturma, tarif oluşturma, beğeni, yorum gibi aktiviteler
 * otomatik olarak görev ilerlemesini günceller.
 */

import { updateQuestProgress, QUEST_TARGET_TYPES } from './quest-system';
import { addCoins, COIN_SOURCES } from './coin-system';
import { checkQuestBadges } from './gamification-badges';

/**
 * Plan oluşturulduğunda görev ilerlemesini günceller
 */
export async function onPlanCreated(userId: string) {
  try {
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.CREATE_PLAN, 1);
    
    // Görev rozetlerini kontrol et
    await checkQuestBadges(userId);
    
    console.log(`Plan oluşturma görevi güncellendi: ${userId}`);
  } catch (error) {
    console.error('Plan oluşturma görev güncellemesi hatası:', error);
    // Hata görev güncellemesini etkilemez, aktivite devam eder
  }
}

/**
 * Plan onaylandığında görev ilerlemesini günceller
 */
export async function onPlanApproved(userId: string) {
  try {
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.APPROVE_PLAN, 1);
    console.log(`Plan onaylama görevi güncellendi: ${userId}`);
  } catch (error) {
    console.error('Plan onaylama görev güncellemesi hatası:', error);
  }
}

/**
 * Tarif oluşturulduğunda görev ilerlemesini günceller
 */
export async function onRecipeCreated(userId: string) {
  try {
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.CREATE_RECIPE, 1);
    console.log(`Tarif oluşturma görevi güncellendi: ${userId}`);
  } catch (error) {
    console.error('Tarif oluşturma görev güncellemesi hatası:', error);
  }
}

/**
 * Tarif onaylandığında görev ilerlemesini günceller
 * Not: Şu an için CREATE_RECIPE ile aynı hedefi kullanıyoruz
 * İleride ayrı bir APPROVE_RECIPE hedefi eklenebilir
 */
export async function onRecipeApproved(userId: string) {
  try {
    // Tarif onaylandığında ek görev ilerlemesi (opsiyonel)
    // Şu an için sadece log tutuyoruz
    console.log(`Tarif onaylandı: ${userId}`);
  } catch (error) {
    console.error('Tarif onaylama görev güncellemesi hatası:', error);
  }
}

/**
 * Beğeni yapıldığında görev ilerlemesini günceller
 * Hem beğeni yapan hem de beğeni alan için
 */
export async function onLikeGiven(likerId: string, ownerId: string) {
  try {
    // Beğeni yapan kullanıcı için görev güncellemesi
    await updateQuestProgress(likerId, QUEST_TARGET_TYPES.LIKE_COUNT, 1);
    
    // Beğeni alan kullanıcı için görev güncellemesi (farklı kullanıcıysa)
    if (likerId !== ownerId) {
      await updateQuestProgress(ownerId, QUEST_TARGET_TYPES.LIKE_COUNT, 1);
    }
    
    console.log(`Beğeni görevi güncellendi: Veren=${likerId}, Alan=${ownerId}`);
  } catch (error) {
    console.error('Beğeni görev güncellemesi hatası:', error);
  }
}

/**
 * Yorum yapıldığında görev ilerlemesini günceller
 * Hem yorum yapan hem de yorum alan için
 */
export async function onCommentGiven(commenterId: string, ownerId: string) {
  try {
    // Yorum yapan kullanıcı için görev güncellemesi
    await updateQuestProgress(commenterId, QUEST_TARGET_TYPES.COMMENT_COUNT, 1);
    
    // Yorum alan kullanıcı için görev güncellemesi (farklı kullanıcıysa)
    if (commenterId !== ownerId) {
      await updateQuestProgress(ownerId, QUEST_TARGET_TYPES.COMMENT_COUNT, 1);
    }
    
    console.log(`Yorum görevi güncellendi: Yapan=${commenterId}, Alan=${ownerId}`);
  } catch (error) {
    console.error('Yorum görev güncellemesi hatası:', error);
  }
}

/**
 * Günlük giriş yapıldığında görev ilerlemesini günceller
 */
export async function onDailyLogin(userId: string) {
  try {
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.DAILY_LOGIN, 1);
    console.log(`Günlük giriş görevi güncellendi: ${userId}`);
  } catch (error) {
    console.error('Günlük giriş görev güncellemesi hatası:', error);
  }
}

/**
 * Kilo kaydı yapıldığında görev ilerlemesini günceller
 */
export async function onWeightLogged(userId: string) {
  try {
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.WEIGHT_LOG, 1);
    console.log(`Kilo kaydı görevi güncellendi: ${userId}`);
  } catch (error) {
    console.error('Kilo kaydı görev güncellemesi hatası:', error);
  }
}

/**
 * Check-in yapıldığında görev ilerlemesini günceller
 */
export async function onCheckIn(userId: string) {
  try {
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.CHECK_IN, 1);
    console.log(`Check-in görevi güncellendi: ${userId}`);
  } catch (error) {
    console.error('Check-in görev güncellemesi hatası:', error);
  }
}

/**
 * Kullanıcı takip edildiğinde görev ilerlemesini günceller
 */
export async function onUserFollowed(followerId: string) {
  try {
    await updateQuestProgress(followerId, QUEST_TARGET_TYPES.FOLLOW_USER, 1);
    console.log(`Takip görevi güncellendi: ${followerId}`);
  } catch (error) {
    console.error('Takip görev güncellemesi hatası:', error);
  }
}

/**
 * Plan görüntülendiğinde görev ilerlemesini günceller
 */
export async function onPlanViewed(userId: string) {
  try {
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.VIEW_PLANS, 1);
    console.log(`Plan görüntüleme görevi güncellendi: ${userId}`);
  } catch (error) {
    console.error('Plan görüntüleme görev güncellemesi hatası:', error);
  }
}

/**
 * Seviye atlandığında bonus coin verir
 */
export async function onLevelUp(userId: string, newLevel: number, oldLevel: number) {
  try {
    // Her seviye için 50 coin bonus
    const levelDiff = newLevel - oldLevel;
    const bonusCoins = levelDiff * 50;
    
    if (bonusCoins > 0) {
      await addCoins(
        userId,
        bonusCoins,
        COIN_SOURCES.LEVEL_UP,
        {
          newLevel,
          oldLevel,
          message: `Seviye ${newLevel}'e ulaştınız!`
        }
      );
      console.log(`Seviye atlama coin bonusu verildi: ${userId} - ${bonusCoins} coin`);
    }
  } catch (error) {
    console.error('Seviye atlama coin bonusu hatası:', error);
  }
}

/**
 * Streak milestone'a ulaşıldığında görev ilerlemesini günceller
 */
export async function onStreakMilestone(userId: string, streakDays: number) {
  try {
    // Streak milestone görevlerini güncelle
    await updateQuestProgress(userId, QUEST_TARGET_TYPES.DAILY_LOGIN, streakDays);
    console.log(`Streak milestone görevi güncellendi: ${userId} - ${streakDays} gün`);
  } catch (error) {
    console.error('Streak milestone görev güncellemesi hatası:', error);
  }
}
