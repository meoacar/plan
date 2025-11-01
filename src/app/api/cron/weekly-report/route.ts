import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Get all groups with weekly goals
    const goals = await prisma.groupWeeklyGoal.findMany({
      where: {
        weekStart,
      },
      include: {
        group: {
          include: {
            members: {
              select: { userId: true },
            },
          },
        },
        progress: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    let reportsGenerated = 0;

    for (const goal of goals) {
      // Calculate completion percentage
      const completionPercentage = goal.targetValue > 0 
        ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
        : 0;

      const isCompleted = completionPercentage >= 100;

      // Update goal completion status
      await prisma.groupWeeklyGoal.update({
        where: { id: goal.id },
        data: { completed: isCompleted },
      });

      // Generate report message
      const reportMessage = isCompleted
        ? `🎉 Tebrikler! ${goal.group.name} grubu haftalık hedefini tamamladı! (%${completionPercentage.toFixed(0)})`
        : `Bu hafta ${goal.group.name} grubu hedefinin %${completionPercentage.toFixed(0)}'ını tamamladı. Devam edin!`;

      // Send report to all group members
      for (const member of goal.group.members) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'GROUP_WEEKLY_GOAL',
            title: 'Haftalık Rapor',
            message: reportMessage,
            actionUrl: `/groups/${goal.group.slug}`,
          },
        });
      }

      reportsGenerated++;
    }

    return NextResponse.json({
      success: true,
      reportsGenerated,
    });
  } catch (error) {
    console.error('Weekly report cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
