import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/groups/[groupId]/weekly-goals/[goalId]/report - Haftalık rapor getir
export async function GET(
  _request: NextRequest,
  { params }: { params: { groupId: string; goalId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, goalId } = params;

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

    // Hedefi ve ilerlemeyi getir
    const goal = await prisma.groupWeeklyGoal.findUnique({
      where: { id: goalId },
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
      },
    });

    if (!goal || goal.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Hedef bulunamadı' },
        { status: 404 }
      );
    }

    // Grup üye sayısını al
    const totalMembers = await prisma.groupMember.count({
      where: { groupId },
    });

    // İstatistikleri hesapla
    const participantCount = goal.progress.length;
    const participationRate = totalMembers > 0
      ? (participantCount / totalMembers) * 100
      : 0;

    const progressPercentage = goal.targetValue > 0
      ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
      : 0;

    const averageContribution = participantCount > 0
      ? goal.currentValue / participantCount
      : 0;

    // En çok katkı sağlayanlar (top 3)
    const topContributors = goal.progress.slice(0, 3);

    // Hedefin durumu
    const now = new Date();
    let status: 'active' | 'completed' | 'expired';
    if (goal.completed) {
      status = 'completed';
    } else if (now > goal.weekEnd) {
      status = 'expired';
    } else {
      status = 'active';
    }

    const report = {
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetType: goal.targetType,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        weekStart: goal.weekStart,
        weekEnd: goal.weekEnd,
        completed: goal.completed,
        status,
      },
      statistics: {
        totalMembers,
        participantCount,
        participationRate: Math.round(participationRate * 10) / 10,
        progressPercentage: Math.round(progressPercentage * 10) / 10,
        averageContribution: Math.round(averageContribution * 10) / 10,
      },
      topContributors: topContributors.map((p: any) => ({
        user: p.user,
        value: p.value,
        percentage: goal.targetValue > 0
          ? Math.round((p.value / goal.targetValue) * 1000) / 10
          : 0,
      })),
      allProgress: goal.progress,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { error: 'Rapor oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
