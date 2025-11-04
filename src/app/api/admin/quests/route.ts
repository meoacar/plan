import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QuestType } from '@prisma/client';

/**
 * GET /api/admin/quests
 * Tüm görevleri listeler (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as QuestType | null;
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    // Filtreleme koşulları
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';

    // Görevleri getir
    const quests = await prisma.quest.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: {
            userQuests: true,
          },
        },
      },
    });

    // İstatistikler
    const stats = await prisma.quest.aggregate({
      _count: true,
      where: { isActive: true },
    });

    const completionStats = await prisma.userQuest.groupBy({
      by: ['questId'],
      _count: {
        completed: true,
      },
      where: {
        completed: true,
      },
    });

    // Tamamlanma oranlarını hesapla
    const questsWithStats = quests.map((quest) => {
      const completionStat = completionStats.find((s) => s.questId === quest.id);
      const totalAssigned = quest._count.userQuests;
      const totalCompleted = completionStat?._count.completed || 0;
      const completionRate =
        totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

      return {
        ...quest,
        totalAssigned,
        totalCompleted,
        completionRate: Math.round(completionRate * 10) / 10,
      };
    });

    return NextResponse.json({
      quests: questsWithStats,
      stats: {
        total: quests.length,
        active: stats._count,
      },
    });
  } catch (error) {
    console.error('Görevleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Görevler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/quests
 * Yeni görev oluşturur (admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      category,
      title,
      description,
      icon,
      targetType,
      targetValue,
      coinReward,
      xpReward,
      isActive,
      priority,
      conditions,
    } = body;

    // Validasyon
    if (!type || !category || !title || !description || !targetType || !targetValue) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Görev oluştur
    const quest = await prisma.quest.create({
      data: {
        type,
        category,
        title,
        description,
        icon: icon || '🎯',
        targetType,
        targetValue: parseInt(targetValue),
        coinReward: parseInt(coinReward) || 0,
        xpReward: parseInt(xpReward) || 0,
        isActive: isActive !== false,
        priority: parseInt(priority) || 0,
        conditions: conditions || null,
      },
    });

    return NextResponse.json({ quest }, { status: 201 });
  } catch (error) {
    console.error('Görev oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Görev oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
