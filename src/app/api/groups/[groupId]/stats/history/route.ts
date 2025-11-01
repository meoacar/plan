import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRecentStatsHistory } from '@/lib/group-stats';

/**
 * GET /api/groups/[groupId]/stats/history
 * Grup istatistikleri geçmişini getirir
 * Query params: days (varsayılan: 30)
 */
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
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Grubun varlığını kontrol et
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Grup bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının grup üyesi olup olmadığını kontrol et
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

    // Geçmiş istatistikleri getir
    const history = await getRecentStatsHistory(groupId, days);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Grup istatistikleri geçmişi getirme hatası:', error);
    return NextResponse.json(
      { error: 'İstatistik geçmişi getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
