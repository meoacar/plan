import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { NotificationEmail } from '@/emails/notification-email';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

export async function sendNotificationEmail(
  userId: string,
  params: EmailNotificationParams
) {
  if (!resend) {
    console.warn('Resend API key not configured, skipping email notification');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    // Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return { success: false, message: 'User email not found' };
    }

    const { type, title, message, actionUrl } = params;

    // Email gönder
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Zayıflama Planım <noreply@zayiflamaplanim.com>',
      to: user.email,
      subject: title,
      react: NotificationEmail({
        userName: user.name || 'Kullanıcı',
        title,
        message,
        actionUrl: actionUrl ? `${process.env.NEXTAUTH_URL}${actionUrl}` : undefined,
        actionText: getActionText(type),
      }),
    });

    return { success: true, result };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error };
  }
}

function getActionText(type: NotificationType): string {
  const mapping: Record<NotificationType, string> = {
    NEW_FOLLOWER: 'Profili Görüntüle',
    COMMENT: 'Yorumu Görüntüle',
    LIKE: 'Planı Görüntüle',
    BADGE_EARNED: 'Rozeti Görüntüle',
    PARTNER_REQUEST: 'İsteği Görüntüle',
    PARTNER_ACCEPTED: 'Partneri Görüntüle',
    RECIPE_APPROVED: 'Tarifi Görüntüle',
    RECIPE_REJECTED: 'Tarifi Görüntüle',
    PLAN_APPROVED: 'Planı Görüntüle',
    PLAN_REJECTED: 'Planı Görüntüle',
    GROUP_INVITE: 'Grubu Görüntüle',
    CHALLENGE_INVITE: 'Challenge\'ı Görüntüle',
    WALL_POST: 'Yazıyı Görüntüle',
    MENTION: 'Görüntüle',
    LEVEL_UP: 'Profilini Görüntüle',
    COMMENT_REACTION: 'Yorumu Görüntüle',
  };

  return mapping[type] || 'Görüntüle';
}

export async function sendWeeklyDigest(userId: string) {
  if (!resend) {
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return { success: false, message: 'User email not found' };
    }

    // Son 7 günün istatistiklerini al
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [newFollowers, newComments, newLikes, earnedBadges] = await Promise.all([
      prisma.follow.count({
        where: {
          followingId: userId,
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.comment.count({
        where: {
          plan: { userId },
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.like.count({
        where: {
          plan: { userId },
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.userBadge.count({
        where: {
          userId,
          earnedAt: { gte: weekAgo },
        },
      }),
    ]);

    // Eğer hiç aktivite yoksa email gönderme
    if (newFollowers === 0 && newComments === 0 && newLikes === 0 && earnedBadges === 0) {
      return { success: false, message: 'No activity this week' };
    }

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Zayıflama Planım <noreply@zayiflamaplanim.com>',
      to: user.email,
      subject: 'Haftalık Özet - Zayıflama Planım',
      html: `
        <h2>Merhaba ${user.name || 'Kullanıcı'},</h2>
        <p>Bu hafta platformda neler oldu:</p>
        <ul>
          ${newFollowers > 0 ? `<li><strong>${newFollowers}</strong> yeni takipçi</li>` : ''}
          ${newComments > 0 ? `<li><strong>${newComments}</strong> yeni yorum</li>` : ''}
          ${newLikes > 0 ? `<li><strong>${newLikes}</strong> yeni beğeni</li>` : ''}
          ${earnedBadges > 0 ? `<li><strong>${earnedBadges}</strong> yeni rozet kazandınız</li>` : ''}
        </ul>
        <p><a href="${process.env.NEXTAUTH_URL}/profil">Profilini Görüntüle</a></p>
      `,
    });

    return { success: true, result };
  } catch (error) {
    console.error('Weekly digest error:', error);
    return { success: false, error };
  }
}
