import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns';

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

    // Get all active groups
    const groups = await prisma.group.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        members: {
          where: {
            role: {
              in: ['ADMIN', 'MODERATOR'],
            },
          },
          take: 1,
        },
      },
    });

    let goalsCreated = 0;

    for (const group of groups) {
      // Check if goal already exists for this week
      const existingGoal = await prisma.groupWeeklyGoal.findUnique({
        where: {
          groupId_weekStart: {
            groupId: group.id,
            weekStart,
          },
        },
      });

      if (!existingGoal && group.members.length > 0) {
        // Create a default weekly goal
        const goal = await prisma.groupWeeklyGoal.create({
          data: {
            groupId: group.id,
            weekStart,
            weekEnd,
            title: 'Haftalık Grup Hedefi',
            description: 'Bu hafta grubumuzun toplam hedefi',
            targetType: 'activity',
            targetValue: 100, // 100 aktivite puanı
            createdBy: group.members[0].userId,
          },
        });

        // Notify all group members
        const allMembers = await prisma.groupMember.findMany({
          where: { groupId: group.id },
          select: { userId: true },
        });

        for (const member of allMembers) {
          await prisma.notification.create({
            data: {
              userId: member.userId,
              type: 'GROUP_WEEKLY_GOAL',
              title: 'Yeni Haftalık Hedef',
              message: `${group.name} grubu için yeni haftalık hedef belirlendi!`,
              actionUrl: `/groups/${group.slug}`,
            },
          });
        }

        goalsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      groupsProcessed: groups.length,
      goalsCreated,
    });
  } catch (error) {
    console.error('Weekly goal create cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
