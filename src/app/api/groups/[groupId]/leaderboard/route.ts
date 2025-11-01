import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLeaderboard } from '@/lib/group-leaderboard';

type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'WEEKLY') as LeaderboardPeriod;
    const limit = parseInt(searchParams.get('limit') || '50');

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
    const leaderboard = await getLeaderboard(groupId, period, limit);

    return NextResponse.json({
      leaderboard,
      period,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Liderlik tablosu getirme hatası:', error);
    return NextResponse.json(
      { error: 'Liderlik tablosu getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
