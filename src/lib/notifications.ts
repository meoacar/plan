import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { sendPushNotification } from './push-notifications';
import { sendNotificationEmail } from './email-notifications';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actorId?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, actionUrl, actorId, relatedId, metadata } = params;

  // Kullanıcı tercihlerini kontrol et
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // In-app bildirim oluştur
  const shouldCreateInApp = shouldSendInApp(type, preferences);
  let notification = null;

  if (shouldCreateInApp) {
    notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
        actorId,
        relatedId,
        metadata,
      },
    });
  }

  // Push bildirimi gönder
  const shouldSendPush = shouldSendPushNotification(type, preferences);
  if (shouldSendPush && !isQuietHours(preferences)) {
    await sendPushNotification(userId, {
      title,
      body: message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: actionUrl || '/',
        notificationId: notification?.id,
      },
    });
  }

  // Email bildirimi gönder
  const shouldSendEmail = shouldSendEmailNotification(type, preferences);
  if (shouldSendEmail) {
    await sendNotificationEmail(userId, {
      type,
      title,
      message,
      actionUrl,
    });
  }

  return notification;
}

function shouldSendInApp(type: NotificationType, preferences: any): boolean {
  if (!preferences) return true; // Varsayılan olarak gönder

  const mapping: Record<NotificationType, keyof typeof preferences> = {
    NEW_FOLLOWER: 'inAppNewFollower',
    FOLLOW_REQUEST: 'inAppNewFollower',
    FOLLOW_ACCEPTED: 'inAppNewFollower',
    COMMENT: 'inAppComment',
    PLAN_COMMENT: 'inAppComment',
    RECIPE_COMMENT: 'inAppComment',
    LIKE: 'inAppLike',
    PLAN_LIKE: 'inAppLike',
    RECIPE_LIKE: 'inAppLike',
    BADGE_EARNED: 'inAppBadge',
    PARTNER_REQUEST: 'inAppPartnerRequest',
    PARTNER_ACCEPTED: 'inAppPartnerRequest',
    RECIPE_APPROVED: 'inAppComment',
    RECIPE_REJECTED: 'inAppComment',
    PLAN_APPROVED: 'inAppComment',
    PLAN_REJECTED: 'inAppComment',
    GROUP_INVITE: 'inAppComment',
    CHALLENGE_INVITE: 'inAppComment',
    WALL_POST: 'inAppComment',
    MENTION: 'inAppComment',
    LEVEL_UP: 'inAppBadge',
    COMMENT_REACTION: 'inAppComment',
  };

  const key = mapping[type];
  return key ? preferences[key] !== false : true;
}

function shouldSendPushNotification(type: NotificationType, preferences: any): boolean {
  if (!preferences) return true;

  const mapping: Record<NotificationType, keyof typeof preferences> = {
    NEW_FOLLOWER: 'pushNewFollower',
    FOLLOW_REQUEST: 'pushNewFollower',
    FOLLOW_ACCEPTED: 'pushNewFollower',
    COMMENT: 'pushComment',
    PLAN_COMMENT: 'pushComment',
    RECIPE_COMMENT: 'pushComment',
    LIKE: 'pushLike',
    PLAN_LIKE: 'pushLike',
    RECIPE_LIKE: 'pushLike',
    BADGE_EARNED: 'pushBadge',
    PARTNER_REQUEST: 'pushPartnerRequest',
    PARTNER_ACCEPTED: 'pushPartnerRequest',
    RECIPE_APPROVED: 'pushComment',
    RECIPE_REJECTED: 'pushComment',
    PLAN_APPROVED: 'pushComment',
    PLAN_REJECTED: 'pushComment',
    GROUP_INVITE: 'pushComment',
    CHALLENGE_INVITE: 'pushComment',
    WALL_POST: 'pushComment',
    MENTION: 'pushComment',
    LEVEL_UP: 'pushBadge',
    COMMENT_REACTION: 'pushComment',
  };

  const key = mapping[type];
  return key ? preferences[key] !== false : true;
}

function shouldSendEmailNotification(type: NotificationType, preferences: any): boolean {
  if (!preferences) return false; // Email için varsayılan kapalı

  const mapping: Record<NotificationType, keyof typeof preferences> = {
    NEW_FOLLOWER: 'emailNewFollower',
    FOLLOW_REQUEST: 'emailNewFollower',
    FOLLOW_ACCEPTED: 'emailNewFollower',
    COMMENT: 'emailComment',
    PLAN_COMMENT: 'emailComment',
    RECIPE_COMMENT: 'emailComment',
    LIKE: 'emailLike',
    PLAN_LIKE: 'emailLike',
    RECIPE_LIKE: 'emailLike',
    BADGE_EARNED: 'emailBadge',
    PARTNER_REQUEST: 'emailPartnerRequest',
    PARTNER_ACCEPTED: 'emailPartnerRequest',
    RECIPE_APPROVED: 'emailComment',
    RECIPE_REJECTED: 'emailComment',
    PLAN_APPROVED: 'emailComment',
    PLAN_REJECTED: 'emailComment',
    GROUP_INVITE: 'emailComment',
    CHALLENGE_INVITE: 'emailComment',
    WALL_POST: 'emailComment',
    MENTION: 'emailComment',
    LEVEL_UP: 'emailBadge',
    COMMENT_REACTION: 'emailComment',
  };

  const key = mapping[type];
  return key ? preferences[key] === true : false;
}

function isQuietHours(preferences: any): boolean {
  if (!preferences?.quietHoursStart || !preferences?.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const start = preferences.quietHoursStart;
  const end = preferences.quietHoursEnd;

  if (start < end) {
    return currentHour >= start && currentHour < end;
  } else {
    // Gece yarısını geçen durumlar (örn: 22:00 - 08:00)
    return currentHour >= start || currentHour < end;
  }
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId,
      userId, // Güvenlik için
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function markAllAsRead(userId: string) {
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

export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.delete({
    where: {
      id: notificationId,
      userId, // Güvenlik için
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: { userId },
    }),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
