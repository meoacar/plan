import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLeaderboard, getUserLeaderboardPosition } from '@/lib/group-leaderboard';

type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string; period: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { groupId, period } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Period validasyonu
    const validPeriods: LeaderboardPeriod[] = ['WEEKLY', 'MONTHLY', 'ALL_TIME'];
    const leaderboardPeriod = period.toUpperCase() as LeaderboardPeriod;

    if (!validPeriods.includes(leaderboardPeriod)) {
      return NextResponse.json(
        { error: 'Geçersiz dönem. WEEKLY, MONTHLY veya ALL_TIME olmalı' },
        { status: 400 }
      );
    }

    // Grup üyeliğini kontrol et
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Bu grubun üyesi değilsiniz' },
        { status: 403 }
      );
    }

    // Liderlik tablosunu getir
    const leaderboard = await getLeaderboard(groupId, leaderboardPeriod, limit);

    // Kullanıcının kendi pozisyonunu getir
    const userPosition = await getUserLeaderboardPosition(
      session.user.id,
      groupId,
      leaderboardPeriod
    );

    return NextResponse.json({
      leaderboard,
      userPosition,
      period: leaderboardPeriod,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Dönemsel liderlik tablosu getirme hatası:', error);
    return NextResponse.json(
      { error: 'Liderlik tablosu getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
