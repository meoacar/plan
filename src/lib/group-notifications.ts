import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { createNotification } from './notifications';

interface GroupNotificationParams {
  groupId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string;
  actorId?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
  excludeUserId?: string;
}

/**
 * Grup üyelerine toplu bildirim gönderir
 * @param params Bildirim parametreleri
 * @returns Gönderilen bildirim sayısı
 */
export async function notifyGroupMembers(params: GroupNotificationParams): Promise<number> {
  const { groupId, excludeUserId, ...notificationData } = params;

  // Grup üyelerini getir
  const members = await prisma.groupMember.findMany({
    where: {
      groupId,
      userId: excludeUserId ? { not: excludeUserId } : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          notificationPreference: true,
        },
      },
    },
  });

  // Her üyeye bildirim gönder
  let sentCount = 0;
  const notificationPromises = members.map(async (member) => {
    try {
      // Bildirim tercihlerini kontrol et
      if (shouldSendGroupNotification(notificationData.type, member.user.notificationPreference)) {
        await createNotification({
          userId: member.userId,
          ...notificationData,
        });
        sentCount++;
      }
    } catch (error) {
      console.error(`Bildirim gönderilemedi (userId: ${member.userId}):`, error);
    }
  });

  await Promise.allSettled(notificationPromises);
  return sentCount;
}

/**
 * Belirli bir kullanıcıya grup bildirimi gönderir
 */
export async function notifyGroupMember(
  userId: string,
  params: Omit<GroupNotificationParams, 'groupId' | 'excludeUserId'>
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notificationPreference: true,
    },
  });

  if (user && shouldSendGroupNotification(params.type, user.notificationPreference)) {
    await createNotification({
      userId,
      ...params,
    });
  }
}

/**
 * Grup yöneticilerine bildirim gönderir
 */
export async function notifyGroupAdmins(params: GroupNotificationParams): Promise<number> {
  const { groupId, excludeUserId, ...notificationData } = params;

  const admins = await prisma.groupMember.findMany({
    where: {
      groupId,
      role: { in: ['ADMIN', 'MODERATOR'] },
      userId: excludeUserId ? { not: excludeUserId } : undefined,
    },
    include: {
      user: {
        select: {
          notificationPreference: true,
        },
      },
    },
  });

  let sentCount = 0;
  const notificationPromises = admins.map(async (admin) => {
    try {
      if (shouldSendGroupNotification(notificationData.type, admin.user.notificationPreference)) {
        await createNotification({
          userId: admin.userId,
          ...notificationData,
        });
        sentCount++;
      }
    } catch (error) {
      console.error(`Admin bildirimi gönderilemedi (userId: ${admin.userId}):`, error);
    }
  });

  await Promise.allSettled(notificationPromises);
  return sentCount;
}

/**
 * Grup bildirim tercihlerini kontrol eder
 */
function shouldSendGroupNotification(
  type: NotificationType,
  preferences: any
): boolean {
  if (!preferences) return true; // Varsayılan olarak gönder

  // Grup bildirimleri için genel kontrol
  // Gelecekte kullanıcılar grup bildirimlerini kapatabilir
  const groupNotificationTypes = [
    'GROUP_NEW_POST',
    'GROUP_NEW_COMMENT',
    'GROUP_NEW_MESSAGE',
    'GROUP_POST_LIKE',
    'GROUP_EVENT_CREATED',
    'GROUP_EVENT_REMINDER',
    'GROUP_MEMBER_JOINED',
    'GROUP_ROLE_CHANGED',
    'GROUP_WEEKLY_GOAL',
    'GROUP_LEADERBOARD_RANK',
    'GROUP_JOIN_REQUEST',
    'GROUP_JOIN_APPROVED',
    'GROUP_JOIN_REJECTED',
  ];

  if (groupNotificationTypes.includes(type)) {
    // Şimdilik tüm grup bildirimlerini gönder
    // Gelecekte preferences'a grup bildirimleri için alanlar eklenebilir
    return true;
  }

  return true;
}

/**
 * Tek bir kullanıcıya bildirim gönderir
 */
export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string;
  actorId?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      notificationPreference: true,
    },
  });

  if (user && shouldSendGroupNotification(params.type, user.notificationPreference)) {
    await createNotification(params);
  }
}

// Bildirim şablonları
export const groupNotificationTemplates = {
  newPost: (groupName: string, authorName: string) => ({
    title: 'Yeni Paylaşım',
    message: `${authorName}, ${groupName} grubunda yeni bir paylaşım yaptı`,
  }),

  newComment: (groupName: string, authorName: string, postAuthorName: string) => ({
    title: 'Yeni Yorum',
    message: `${authorName}, ${groupName} grubunda ${postAuthorName} adlı kişinin paylaşımına yorum yaptı`,
  }),

  newMessage: (groupName: string, authorName: string) => ({
    title: 'Yeni Mesaj',
    message: `${authorName}, ${groupName} grubunda yeni bir mesaj gönderdi`,
  }),

  postLike: (groupName: string, likerName: string) => ({
    title: 'Paylaşımınız Beğenildi',
    message: `${likerName}, ${groupName} grubundaki paylaşımınızı beğendi`,
  }),

  eventCreated: (groupName: string, eventTitle: string) => ({
    title: 'Yeni Etkinlik',
    message: `${groupName} grubunda yeni bir etkinlik oluşturuldu: ${eventTitle}`,
  }),

  eventReminder: (eventTitle: string, hoursUntil: number) => ({
    title: 'Etkinlik Hatırlatması',
    message: `"${eventTitle}" etkinliği ${hoursUntil} saat sonra başlayacak`,
  }),

  memberJoined: (groupName: string, memberName: string) => ({
    title: 'Yeni Üye',
    message: `${memberName}, ${groupName} grubuna katıldı`,
  }),

  roleChanged: (groupName: string, newRole: string) => ({
    title: 'Rol Değişikliği',
    message: `${groupName} grubundaki rolünüz ${newRole} olarak değiştirildi`,
  }),

  weeklyGoal: (groupName: string, goalTitle: string) => ({
    title: 'Haftalık Hedef',
    message: `${groupName} grubunda yeni haftalık hedef: ${goalTitle}`,
  }),

  leaderboardRank: (groupName: string, rank: number, period: string) => ({
    title: 'Liderlik Tablosu',
    message: `${groupName} grubunda ${period} liderlik tablosunda ${rank}. sıradasınız!`,
  }),

  joinRequest: (groupName: string, requesterName: string) => ({
    title: 'Katılma İsteği',
    message: `${requesterName}, ${groupName} grubuna katılmak istiyor`,
  }),

  joinApproved: (groupName: string) => ({
    title: 'Katılma İsteği Onaylandı',
    message: `${groupName} grubuna katılma isteğiniz onaylandı`,
  }),

  joinRequestApproved: (groupName: string) => ({
    title: 'Katılma İsteği Onaylandı',
    message: `${groupName} grubuna katılma isteğiniz onaylandı`,
  }),

  joinRejected: (groupName: string) => ({
    title: 'Katılma İsteği Reddedildi',
    message: `${groupName} grubuna katılma isteğiniz reddedildi`,
  }),
};

// Yardımcı fonksiyonlar
export async function getGroupName(groupId: string): Promise<string> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { name: true },
  });
  return group?.name || 'Grup';
}

export async function getUserName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return user?.name || 'Kullanıcı';
}
