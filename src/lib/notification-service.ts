import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actorId?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

/**
 * Bildirim oluşturur
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        actorId: params.actorId,
        relatedId: params.relatedId,
        metadata: params.metadata,
      },
    });

    return notification;
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Görev tamamlama bildirimi gönderir
 */
export async function notifyQuestCompleted(
  userId: string,
  questTitle: string,
  coinReward: number,
  xpReward: number,
  questId: string
) {
  return createNotification({
    userId,
    type: 'QUEST_COMPLETED',
    title: '🎉 Görev Tamamlandı!',
    message: `"${questTitle}" görevini tamamladın! ${coinReward} coin ve ${xpReward} XP kazandın.`,
    actionUrl: '/gamification',
    relatedId: questId,
    metadata: {
      coinReward,
      xpReward,
      questTitle,
    },
  });
}

/**
 * Yeni görev bildirimi gönderir
 */
export async function notifyNewQuests(userId: string, questCount: number) {
  return createNotification({
    userId,
    type: 'QUEST_AVAILABLE',
    title: '📋 Yeni Görevler!',
    message: `${questCount} yeni görev seni bekliyor. Hemen tamamla ve ödülleri kazan!`,
    actionUrl: '/gamification',
    metadata: {
      questCount,
    },
  });
}

/**
 * Seviye atlama bildirimi gönderir
 */
export async function notifyLevelUp(
  userId: string,
  newLevel: number,
  bonusCoins: number
) {
  return createNotification({
    userId,
    type: 'LEVEL_UP',
    title: '🎊 Seviye Atladın!',
    message: `Tebrikler! ${newLevel}. seviyeye ulaştın ve ${bonusCoins} bonus coin kazandın!`,
    actionUrl: '/profile',
    metadata: {
      newLevel,
      bonusCoins,
    },
  });
}

/**
 * Coin kazanma bildirimi gönderir
 */
export async function notifyCoinEarned(
  userId: string,
  amount: number,
  source: string,
  sourceTitle?: string
) {
  const sourceMessages: Record<string, string> = {
    QUEST: sourceTitle ? `"${sourceTitle}" görevinden` : 'görevden',
    GAME: sourceTitle ? `${sourceTitle} oyunundan` : 'oyundan',
    STREAK: 'streak bonusundan',
    LEVEL_UP: 'seviye atlamadan',
    DAILY_LOGIN: 'günlük girişten',
  };

  const sourceMsg = sourceMessages[source] || 'aktiviteden';

  return createNotification({
    userId,
    type: 'COIN_EARNED',
    title: '💰 Coin Kazandın!',
    message: `${amount} coin ${sourceMsg} kazandın!`,
    actionUrl: '/gamification',
    metadata: {
      amount,
      source,
      sourceTitle,
    },
  });
}

/**
 * Ödül satın alma onay bildirimi gönderir
 */
export async function notifyRewardPurchased(
  userId: string,
  rewardName: string,
  coinsPaid: number,
  rewardId: string
) {
  return createNotification({
    userId,
    type: 'REWARD_PURCHASED',
    title: '🎁 Ödül Satın Alındı!',
    message: `"${rewardName}" ödülünü ${coinsPaid} coin karşılığında satın aldın. Ödüllerim sayfasından kullanabilirsin.`,
    actionUrl: '/shop/my-rewards',
    relatedId: rewardId,
    metadata: {
      rewardName,
      coinsPaid,
    },
  });
}

/**
 * Streak milestone bildirimi gönderir
 */
export async function notifyStreakMilestone(
  userId: string,
  streakDays: number,
  coinReward: number,
  xpReward: number,
  badgeName?: string
) {
  const milestoneMessages: Record<number, string> = {
    7: '1 hafta',
    30: '1 ay',
    100: '100 gün',
  };

  const milestone = milestoneMessages[streakDays] || `${streakDays} gün`;

  let message = `${milestone} streak yaptın! ${coinReward} coin ve ${xpReward} XP kazandın.`;
  if (badgeName) {
    message += ` Ayrıca "${badgeName}" rozetini kazandın!`;
  }

  return createNotification({
    userId,
    type: 'STREAK_MILESTONE',
    title: '🔥 Streak Milestone!',
    message,
    actionUrl: '/profile',
    metadata: {
      streakDays,
      coinReward,
      xpReward,
      badgeName,
    },
  });
}

/**
 * Toplu bildirim gönderir
 */
export async function createBulkNotifications(
  notifications: CreateNotificationParams[]
) {
  try {
    const notificationsData = notifications.map((notif) => ({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      actionUrl: notif.actionUrl,
      actorId: notif.actorId,
      relatedId: notif.relatedId,
      metadata: notif.metadata,
    }));

    const result = await prisma.notification.createMany({
      data: notificationsData,
    });

    return result;
  } catch (error) {
    console.error('Toplu bildirim oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının okunmamış bildirim sayısını getirir
 */
export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Bildirimi okundu olarak işaretler
 */
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Tüm bildirimleri okundu olarak işaretler
 */
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}
