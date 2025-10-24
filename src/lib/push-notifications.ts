import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// VAPID keys'i yapılandır
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@zayiflamaplanim.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(userId: string, payload: PushPayload) {
  try {
    // Kullanıcının tüm push subscription'larını al
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return { success: false, message: 'No subscriptions found' };
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            JSON.stringify(payload)
          );

          // Son kullanım tarihini güncelle
          await prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { lastUsedAt: new Date() },
          });

          return { success: true, subscriptionId: sub.id };
        } catch (error: any) {
          // Subscription geçersizse sil
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: successful > 0,
      sent: successful,
      failed,
      total: subscriptions.length,
    };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, error };
  }
}

export async function subscribeToPush(
  userId: string,
  subscription: PushSubscriptionJSON,
  userAgent?: string
) {
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error('Invalid subscription object');
  }

  // Aynı endpoint varsa güncelle, yoksa oluştur
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
      lastUsedAt: new Date(),
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
  });
}

export async function unsubscribeFromPush(endpoint: string) {
  return prisma.pushSubscription.delete({
    where: { endpoint },
  });
}

export async function cleanupOldSubscriptions(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return prisma.pushSubscription.deleteMany({
    where: {
      lastUsedAt: {
        lt: cutoffDate,
      },
    },
  });
}
