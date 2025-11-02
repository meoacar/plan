import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/groups/[groupId]/weekly-goals/history - Geçmiş haftalık hedefleri getir
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Geçmiş hedefleri getir
    const [goals, total] = await Promise.all([
      prisma.groupWeeklyGoal.findMany({
        where: {
          groupId,
          weekEnd: { lt: now },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              progress: true,
            },
          },
        },
        orderBy: { weekStart: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.groupWeeklyGoal.count({
        where: {
          groupId,
          weekEnd: { lt: now },
        },
      }),
    ]);

    // Her hedef için ilerleme yüzdesini hesapla
    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progressPercentage: goal.targetValue > 0
        ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
        : 0,
    }));

    return NextResponse.json({
      goals: goalsWithProgress,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching weekly goals history:', error);
    return NextResponse.json(
      { error: 'Geçmiş hedefler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
