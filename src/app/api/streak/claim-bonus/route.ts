import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { grantStreakBonus, checkStreakMilestone } from '@/lib/streak-bonus';
import { createNotification } from '@/lib/notification-service';

/**
 * POST /api/streak/claim-bonus
 * 
 * Kullanıcının streak bonusunu talep etmesini sağlar
 * 
 * Body: { streakDays: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { streakDays } = body;

    // Validasyon
    if (!streakDays || typeof streakDays !== 'number') {
      return NextResponse.json(
        { error: 'Geçersiz streak günü' },
        { status: 400 }
      );
    }

    // Milestone kontrolü
    const milestoneCheck = await checkStreakMilestone(userId, streakDays);

    if (!milestoneCheck) {
      return NextResponse.json(
        { error: 'Bu streak değeri için bir milestone bulunamadı' },
        { status: 404 }
      );
    }

    if (milestoneCheck.alreadyClaimed) {
      return NextResponse.json(
        { error: 'Bu bonus daha önce alınmış' },
        { status: 400 }
      );
    }

    // Bonusu ver
    const result = await grantStreakBonus(userId, streakDays);

    // Bildirim oluştur
    try {
      await createNotification({
        userId,
        type: 'BADGE_EARNED',
        title: '🎉 Streak Bonusu Kazandınız!',
        message: `${streakDays} gün ardışık giriş yaptınız! ${result.coinReward} coin ve ${result.xpReward} XP kazandınız.`,
        actionUrl: '/profile',
        metadata: {
          streakDays,
          coinReward: result.coinReward,
          xpReward: result.xpReward,
          badge: result.badge?.Badge.type,
        },
      });
    } catch (notificationError) {
      console.error('Bildirim oluşturma hatası:', notificationError);
      // Bildirim hatası ana işlemi etkilemesin
    }

    return NextResponse.json({
      success: true,
      data: {
        coins: result.coins,
        xp: result.xp,
        level: result.level,
        leveledUp: result.leveledUp,
        coinReward: result.coinReward,
        xpReward: result.xpReward,
        badge: result.badge
          ? {
              type: result.badge.Badge.type,
              name: result.badge.Badge.name,
              description: result.badge.Badge.description,
              icon: result.badge.Badge.icon,
            }
          : null,
      },
      message: `Tebrikler! ${streakDays} gün streak bonusu aldınız!`,
    });
  } catch (error) {
    console.error('Streak bonus claim error:', error);

    // Özel hata mesajları
    if (error instanceof Error) {
      if (error.message.includes('ulaşmamış')) {
        return NextResponse.json(
          { error: 'Henüz bu milestone\'a ulaşmadınız' },
          { status: 400 }
        );
      }
      if (error.message.includes('daha önce alınmış')) {
        return NextResponse.json(
          { error: 'Bu bonus daha önce alınmış' },
          { status: 400 }
        );
      }
      if (error.message.includes('Geçersiz')) {
        return NextResponse.json(
          { error: 'Geçersiz streak milestone' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Bonus talep edilirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
