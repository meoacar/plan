import { prisma } from '@/lib/prisma';
import { QuestType } from '@prisma/client';
import { notifyQuestCompleted, notifyNewQuests } from '@/lib/notification-service';

/**
 * Görev Sistemi - Backend Altyapısı
 * 
 * Bu modül günlük, haftalık ve özel görevlerin yönetimini sağlar.
 * Görev atama, ilerleme güncelleme, tamamlama kontrolü ve ödül verme işlemlerini içerir.
 */

// Görev kategorileri
export const QUEST_CATEGORIES = {
  PLAN: 'PLAN',
  RECIPE: 'RECIPE',
  SOCIAL: 'SOCIAL',
  ACTIVITY: 'ACTIVITY',
} as const;

// Görev hedef tipleri
export const QUEST_TARGET_TYPES = {
  CREATE_PLAN: 'CREATE_PLAN',
  APPROVE_PLAN: 'APPROVE_PLAN',
  LIKE_COUNT: 'LIKE_COUNT',
  COMMENT_COUNT: 'COMMENT_COUNT',
  CREATE_RECIPE: 'CREATE_RECIPE',
  DAILY_LOGIN: 'DAILY_LOGIN',
  WEIGHT_LOG: 'WEIGHT_LOG',
  CHECK_IN: 'CHECK_IN',
  FOLLOW_USER: 'FOLLOW_USER',
  VIEW_PLANS: 'VIEW_PLANS',
} as const;

/**
 * Kullanıcıya günlük görevler atar
 * Her gün saat 00:00'da çalışır
 */
export async function assignDailyQuests(userId: string) {
  try {
    // Aktif günlük görevleri al
    const dailyQuests = await prisma.quest.findMany({
      where: {
        type: QuestType.DAILY,
        isActive: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    if (dailyQuests.length === 0) {
      console.log('Atanacak günlük görev bulunamadı');
      return [];
    }

    // Bugünün başlangıcı ve bitişi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bugün için zaten atanmış görevleri kontrol et
    const existingQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        assignedAt: {
          gte: today,
          lt: tomorrow,
        },
        quest: {
          type: QuestType.DAILY,
        },
      },
    });

    if (existingQuests.length > 0) {
      console.log(`Kullanıcı ${userId} için bugün zaten görevler atanmış`);
      return existingQuests;
    }

    // Yeni görevleri ata (maksimum 3-5 günlük görev)
    const questsToAssign = dailyQuests.slice(0, 5);
    const userQuests = await Promise.all(
      questsToAssign.map((quest) =>
        prisma.userQuest.create({
          data: {
            userId,
            questId: quest.id,
            progress: 0,
            completed: false,
            assignedAt: new Date(),
            expiresAt: tomorrow,
            rewardClaimed: false,
          },
          include: {
            quest: true,
          },
        })
      )
    );

    console.log(`${userQuests.length} günlük görev ${userId} kullanıcısına atandı`);
    
    // Yeni görev bildirimi gönder
    try {
      await notifyNewQuests(userId, userQuests.length);
    } catch (notifError) {
      console.error('Görev bildirimi gönderme hatası:', notifError);
      // Bildirim hatası görev atamasını etkilemez
    }
    
    return userQuests;
  } catch (error) {
    console.error('Günlük görev atama hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcıya haftalık görevler atar
 * Her Pazartesi saat 00:00'da çalışır
 */
export async function assignWeeklyQuests(userId: string) {
  try {
    // Aktif haftalık görevleri al
    const weeklyQuests = await prisma.quest.findMany({
      where: {
        type: QuestType.WEEKLY,
        isActive: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    if (weeklyQuests.length === 0) {
      console.log('Atanacak haftalık görev bulunamadı');
      return [];
    }

    // Bu haftanın başlangıcı (Pazartesi) ve bitişi (Pazar)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazartesi'ye ayarla
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Bu hafta için zaten atanmış görevleri kontrol et
    const existingQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        assignedAt: {
          gte: weekStart,
          lt: weekEnd,
        },
        quest: {
          type: QuestType.WEEKLY,
        },
      },
    });

    if (existingQuests.length > 0) {
      console.log(`Kullanıcı ${userId} için bu hafta zaten görevler atanmış`);
      return existingQuests;
    }

    // Yeni görevleri ata (maksimum 2-3 haftalık görev)
    const questsToAssign = weeklyQuests.slice(0, 3);
    const userQuests = await Promise.all(
      questsToAssign.map((quest) =>
        prisma.userQuest.create({
          data: {
            userId,
            questId: quest.id,
            progress: 0,
            completed: false,
            assignedAt: new Date(),
            expiresAt: weekEnd,
            rewardClaimed: false,
          },
          include: {
            quest: true,
          },
        })
      )
    );

    console.log(`${userQuests.length} haftalık görev ${userId} kullanıcısına atandı`);
    
    // Yeni görev bildirimi gönder
    try {
      await notifyNewQuests(userId, userQuests.length);
    } catch (notifError) {
      console.error('Görev bildirimi gönderme hatası:', notifError);
      // Bildirim hatası görev atamasını etkilemez
    }
    
    return userQuests;
  } catch (error) {
    console.error('Haftalık görev atama hatası:', error);
    throw error;
  }
}

/**
 * Görev ilerlemesini günceller
 * Kullanıcı bir aktivite yaptığında çağrılır
 */
export async function updateQuestProgress(
  userId: string,
  targetType: string,
  incrementValue: number = 1
) {
  try {
    // Kullanıcının aktif görevlerini al
    const activeQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        completed: false,
        expiresAt: {
          gt: new Date(),
        },
        quest: {
          targetType,
          isActive: true,
        },
      },
      include: {
        quest: true,
      },
    });

    if (activeQuests.length === 0) {
      return [];
    }

    const updatedQuests = [];

    for (const userQuest of activeQuests) {
      const newProgress = userQuest.progress + incrementValue;
      const isCompleted = newProgress >= userQuest.quest.targetValue;

      const updated = await prisma.userQuest.update({
        where: { id: userQuest.id },
        data: {
          progress: newProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        include: {
          quest: true,
        },
      });

      updatedQuests.push(updated);

      // Görev tamamlandıysa log tut ve bildirim gönder
      if (isCompleted) {
        console.log(
          `Görev tamamlandı: ${userQuest.quest.title} - Kullanıcı: ${userId}`
        );
        
        // Görev tamamlama bildirimi gönder
        try {
          await notifyQuestCompleted(
            userId,
            userQuest.quest.title,
            userQuest.quest.coinReward,
            userQuest.quest.xpReward,
            userQuest.quest.id
          );
        } catch (notifError) {
          console.error('Görev tamamlama bildirimi gönderme hatası:', notifError);
          // Bildirim hatası görev tamamlamasını etkilemez
        }
      }
    }

    return updatedQuests;
  } catch (error) {
    console.error('Görev ilerleme güncelleme hatası:', error);
    throw error;
  }
}

/**
 * Görev tamamlanma durumunu kontrol eder
 */
export async function checkQuestCompletion(userQuestId: string) {
  try {
    const userQuest = await prisma.userQuest.findUnique({
      where: { id: userQuestId },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new Error('Görev bulunamadı');
    }

    // İlerleme hedef değere ulaştı mı?
    const isCompleted = userQuest.progress >= userQuest.quest.targetValue;

    // Eğer tamamlandıysa ve henüz işaretlenmemişse güncelle
    if (isCompleted && !userQuest.completed) {
      const updated = await prisma.userQuest.update({
        where: { id: userQuestId },
        data: {
          completed: true,
          completedAt: new Date(),
        },
        include: {
          quest: true,
        },
      });

      return {
        completed: true,
        userQuest: updated,
      };
    }

    return {
      completed: isCompleted,
      userQuest,
    };
  } catch (error) {
    console.error('Görev tamamlanma kontrolü hatası:', error);
    throw error;
  }
}

/**
 * Görev ödülünü talep eder
 * Kullanıcı tamamlanan görevin ödülünü almak istediğinde çağrılır
 */
export async function claimQuestReward(userQuestId: string, userId: string) {
  try {
    const userQuest = await prisma.userQuest.findUnique({
      where: { id: userQuestId },
      include: {
        quest: true,
        user: true,
      },
    });

    if (!userQuest) {
      throw new Error('Görev bulunamadı');
    }

    // Görev bu kullanıcıya ait mi?
    if (userQuest.userId !== userId) {
      throw new Error('Bu görev size ait değil');
    }

    // Görev tamamlanmış mı?
    if (!userQuest.completed) {
      throw new Error('Görev henüz tamamlanmadı');
    }

    // Ödül zaten alınmış mı?
    if (userQuest.rewardClaimed) {
      throw new Error('Ödül zaten alındı');
    }

    // Görev süresi dolmuş mu?
    if (userQuest.expiresAt && userQuest.expiresAt < new Date()) {
      throw new Error('Görev süresi doldu');
    }

    // Transaction ile ödül ver
    const result = await prisma.$transaction(async (tx) => {
      // Coin ödülü ver
      if (userQuest.quest.coinReward > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            coins: {
              increment: userQuest.quest.coinReward,
            },
          },
        });

        // Coin işlem kaydı oluştur
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: userQuest.quest.coinReward,
            type: 'EARN',
            reason: `Görev tamamlandı: ${userQuest.quest.title}`,
            metadata: {
              questId: userQuest.quest.id,
              questType: userQuest.quest.type,
              userQuestId: userQuest.id,
            },
          },
        });
      }

      // XP ödülü ver
      if (userQuest.quest.xpReward > 0) {
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { xp: true, level: true },
        });

        if (currentUser) {
          const newXP = (currentUser.xp || 0) + userQuest.quest.xpReward;
          const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

          await tx.user.update({
            where: { id: userId },
            data: {
              xp: newXP,
              level: newLevel,
            },
          });
        }
      }

      // Ödül alındı olarak işaretle
      const updatedUserQuest = await tx.userQuest.update({
        where: { id: userQuestId },
        data: {
          rewardClaimed: true,
        },
        include: {
          quest: true,
        },
      });

      return updatedUserQuest;
    });

    console.log(
      `Ödül talep edildi: ${userQuest.quest.title} - Kullanıcı: ${userId} - Coin: ${userQuest.quest.coinReward}, XP: ${userQuest.quest.xpReward}`
    );

    return {
      success: true,
      userQuest: result,
      rewards: {
        coins: userQuest.quest.coinReward,
        xp: userQuest.quest.xpReward,
      },
    };
  } catch (error) {
    console.error('Ödül talep etme hatası:', error);
    throw error;
  }
}

/**
 * Süresi dolan görevleri temizler
 * Cron job tarafından çağrılır
 */
export async function cleanupExpiredQuests() {
  try {
    const now = new Date();

    // Süresi dolmuş ve tamamlanmamış görevleri bul
    const expiredQuests = await prisma.userQuest.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
        completed: false,
      },
    });

    console.log(`${expiredQuests.count} süresi dolmuş görev temizlendi`);
    return expiredQuests.count;
  } catch (error) {
    console.error('Süresi dolan görevleri temizleme hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının aktif görevlerini getirir
 */
export async function getUserActiveQuests(userId: string) {
  try {
    const quests = await prisma.userQuest.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        quest: true,
      },
      orderBy: [
        { completed: 'asc' },
        { quest: { priority: 'desc' } },
        { assignedAt: 'desc' },
      ],
    });

    // Kategorilere göre grupla
    const daily = quests.filter((q) => q.quest.type === QuestType.DAILY);
    const weekly = quests.filter((q) => q.quest.type === QuestType.WEEKLY);
    const special = quests.filter((q) => q.quest.type === QuestType.SPECIAL);

    return {
      daily,
      weekly,
      special,
      all: quests,
    };
  } catch (error) {
    console.error('Aktif görevleri getirme hatası:', error);
    throw error;
  }
}

/**
 * Tüm kullanıcılara günlük görevler atar
 * Cron job tarafından çağrılır
 */
export async function assignDailyQuestsToAllUsers() {
  try {
    // Tüm aktif kullanıcıları al
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    console.log(`${users.length} kullanıcıya günlük görevler atanıyor...`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await assignDailyQuests(user.id);
        successCount++;
      } catch (error) {
        console.error(`Kullanıcı ${user.id} için görev atama hatası:`, error);
        errorCount++;
      }
    }

    console.log(
      `Günlük görev atama tamamlandı. Başarılı: ${successCount}, Hata: ${errorCount}`
    );

    return { successCount, errorCount, total: users.length };
  } catch (error) {
    console.error('Toplu günlük görev atama hatası:', error);
    throw error;
  }
}

/**
 * Tüm kullanıcılara haftalık görevler atar
 * Cron job tarafından çağrılır
 */
export async function assignWeeklyQuestsToAllUsers() {
  try {
    // Tüm aktif kullanıcıları al
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    console.log(`${users.length} kullanıcıya haftalık görevler atanıyor...`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await assignWeeklyQuests(user.id);
        successCount++;
      } catch (error) {
        console.error(`Kullanıcı ${user.id} için görev atama hatası:`, error);
        errorCount++;
      }
    }

    console.log(
      `Haftalık görev atama tamamlandı. Başarılı: ${successCount}, Hata: ${errorCount}`
    );

    return { successCount, errorCount, total: users.length };
  } catch (error) {
    console.error('Toplu haftalık görev atama hatası:', error);
    throw error;
  }
}
