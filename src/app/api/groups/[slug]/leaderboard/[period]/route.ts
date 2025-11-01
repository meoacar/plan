import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLeaderboard, getUserLeaderboardPosition, calculateGroupLeaderboard } from '@/lib/group-leaderboard';

type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; period: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { slug, period } = params;
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

    // Grubu slug ile bul
    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Grup bulunamadı' },
        { status: 404 }
      );
    }

    // Grup üyeliğini kontrol et
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
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
    let leaderboard = await getLeaderboard(group.id, leaderboardPeriod, limit);

    // Eğer liderlik tablosu boşsa, hesapla
    if (leaderboard.length === 0) {
      try {
        await calculateGroupLeaderboard(group.id, leaderboardPeriod);
        leaderboard = await getLeaderboard(group.id, leaderboardPeriod, limit);
      } catch (calcError) {
        console.error('Liderlik tablosu hesaplama hatası:', calcError);
        // Hesaplama hatası olsa bile boş array döndür
      }
    }

    // Kullanıcının kendi pozisyonunu getir
    const userPosition = await getUserLeaderboardPosition(
      session.user.id,
      group.id,
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
