import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/groups/[groupId]/weekly-goals/current - Güncel haftalık hedefi getir
export async function GET(
  _request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;

    // Grup üyeliğini kontrol et
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Bu grubun üyesi değilsiniz' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Güncel haftalık hedefi bul
    const currentGoal = await prisma.groupWeeklyGoal.findFirst({
      where: {
        groupId,
        weekStart: { lte: now },
        weekEnd: { gte: now },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        progress: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            value: 'desc',
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
    });

    if (!currentGoal) {
      return NextResponse.json(
        { error: 'Güncel haftalık hedef bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının kendi ilerlemesini bul
    const userProgress = currentGoal.progress.find(
      (p: any) => p.userId === session.user.id
    );

    // İlerleme yüzdesini hesapla
    const progressPercentage = currentGoal.targetValue > 0
      ? Math.min((currentGoal.currentValue / currentGoal.targetValue) * 100, 100)
      : 0;

    return NextResponse.json({
      ...currentGoal,
      progressPercentage,
      userProgress,
    });
  } catch (error) {
    console.error('Error fetching current weekly goal:', error);
    return NextResponse.json(
      { error: 'Güncel hedef getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
