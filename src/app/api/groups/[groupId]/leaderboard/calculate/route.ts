import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateGroupLeaderboard } from '@/lib/group-leaderboard';
import { notifyGroupMember, getGroupName, groupNotificationTemplates } from '@/lib/group-notifications';

type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    // Cron job için secret kontrolü
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Eğer cron secret varsa ve eşleşiyorsa, session kontrolü yapma
    const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronJob) {
      // Normal kullanıcı isteği - admin kontrolü yap
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Oturum açmanız gerekiyor' },
          { status: 401 }
        );
      }

      const { groupId } = params;

      // Admin veya moderatör kontrolü
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: session.user.id,
          },
        },
      });

      if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MODERATOR')) {
        return NextResponse.json(
          { error: 'Bu işlem için yetkiniz yok' },
          { status: 403 }
        );
      }
    }

    const { groupId } = params;
    const body = await request.json();
    const period = (body.period || 'WEEKLY') as LeaderboardPeriod;

    // Liderlik tablosunu hesapla
    await calculateGroupLeaderboard(groupId, period);

    // İlk 3'e girenlere bildirim gönder (opsiyonel)
    if (period === 'WEEKLY') {
      await sendTopThreeNotifications(groupId, period);
    }

    return NextResponse.json({
      success: true,
      message: 'Liderlik tablosu başarıyla hesaplandı',
      period,
    });
  } catch (error) {
    console.error('Liderlik tablosu hesaplama hatası:', error);
    return NextResponse.json(
      { error: 'Liderlik tablosu hesaplanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * İlk 3'e girenlere bildirim gönder
 */
async function sendTopThreeNotifications(
  groupId: string,
  period: LeaderboardPeriod
) {
  try {
    const { getLeaderboard } = await import('@/lib/group-leaderboard');
    const leaderboard = await getLeaderboard(groupId, period, 3);

    const groupName = await getGroupName(groupId);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { slug: true },
    });

    if (!group) return;

    const periodText = period === 'WEEKLY' ? 'haftalık' : period === 'MONTHLY' ? 'aylık' : 'genel';

    for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
      const entry = leaderboard[i];
      const rank = i + 1;

      const notification = groupNotificationTemplates.leaderboardRank(groupName, rank, periodText);

      await notifyGroupMember(entry.userId, {
        type: 'GROUP_LEADERBOARD_RANK',
        title: notification.title,
        message: notification.message,
        actionUrl: `/groups/${group.slug}/leaderboard`,
        relatedId: groupId,
      });
    }
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
  }
}
