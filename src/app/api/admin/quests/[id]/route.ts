import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/quests/[id]
 * Belirli bir görevi getirir (admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const quest = await prisma.quest.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            userQuests: true,
          },
        },
      },
    });

    if (!quest) {
      return NextResponse.json(
        { error: 'Görev bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quest });
  } catch (error) {
    console.error('Görev getirme hatası:', error);
    return NextResponse.json(
      { error: 'Görev getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/quests/[id]
 * Görevi günceller (admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Görev var mı kontrol et
    const existingQuest = await prisma.quest.findUnique({
      where: { id: params.id },
    });

    if (!existingQuest) {
      return NextResponse.json(
        { error: 'Görev bulunamadı' },
        { status: 404 }
      );
    }

    // Görev güncelle
    const quest = await prisma.quest.update({
      where: { id: params.id },
      data: {
        ...(type && { type }),
        ...(category && { category }),
        ...(title && { title }),
        ...(description && { description }),
        ...(icon !== undefined && { icon }),
        ...(targetType && { targetType }),
        ...(targetValue !== undefined && { targetValue: parseInt(targetValue) }),
        ...(coinReward !== undefined && { coinReward: parseInt(coinReward) }),
        ...(xpReward !== undefined && { xpReward: parseInt(xpReward) }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority: parseInt(priority) }),
        ...(conditions !== undefined && { conditions }),
      },
    });

    return NextResponse.json({ quest });
  } catch (error) {
    console.error('Görev güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Görev güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/quests/[id]
 * Görevi siler (admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Görev var mı kontrol et
    const existingQuest = await prisma.quest.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            userQuests: true,
          },
        },
      },
    });

    if (!existingQuest) {
      return NextResponse.json(
        { error: 'Görev bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer kullanıcılara atanmış görevler varsa, sadece pasif yap
    if (existingQuest._count.userQuests > 0) {
      const quest = await prisma.quest.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Görev pasif hale getirildi (kullanıcılara atanmış görevler var)',
        quest,
      });
    }

    // Hiç atanmamışsa tamamen sil
    await prisma.quest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Görev başarıyla silindi',
    });
  } catch (error) {
    console.error('Görev silme hatası:', error);
    return NextResponse.json(
      { error: 'Görev silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
