import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveGroupStats, saveGroupStatsHistory } from '@/lib/group-stats';

/**
 * POST /api/groups/[groupId]/stats/calculate
 * Grup istatistiklerini hesaplar ve kaydeder
 * Bu endpoint cron job veya admin tarafından kullanılır
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    
    // Cron secret kontrolü (cron job için)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`;

    // Eğer cron job değilse, kullanıcı admin olmalı
    if (!isCronJob) {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Oturum açmanız gerekiyor' },
          { status: 401 }
        );
      }

      const { groupId } = params;

      // Kullanıcının grup admini olup olmadığını kontrol et
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: session.user.id,
          },
        },
      });

      if (!membership || membership.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Bu işlem için yetkiniz yok' },
          { status: 403 }
        );
      }
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

    // İstatistikleri hesapla ve kaydet
    await saveGroupStats(groupId);
    await saveGroupStatsHistory(groupId);

    // Güncel istatistikleri getir
    const stats = await prisma.groupStats.findUnique({
      where: { 
        groupId 
      },
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Grup istatistikleri hesaplama hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler hesaplanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
