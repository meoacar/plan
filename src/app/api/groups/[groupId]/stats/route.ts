import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateGroupStats } from '@/lib/group-stats';

/**
 * GET /api/groups/[groupId]/stats
 * Güncel grup istatistiklerini getirir
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

    // Önce veritabanından kayıtlı istatistikleri kontrol et
    let stats = await prisma.groupStats.findUnique({
      where: { groupId },
    });

    // Eğer istatistik yoksa veya 1 saatten eski ise yeniden hesapla
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!stats || stats.lastCalculated < oneHourAgo) {
      const calculatedStats = await calculateGroupStats(groupId);
      
      stats = await prisma.groupStats.upsert({
        where: { groupId },
        create: {
          groupId,
          ...calculatedStats,
        },
        update: {
          ...calculatedStats,
        },
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Grup istatistikleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
