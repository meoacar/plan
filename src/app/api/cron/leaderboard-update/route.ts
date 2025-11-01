import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

async function calculateLeaderboard(groupId: string, period: 'WEEKLY' | 'MONTHLY') {
  const now = new Date();
  const periodStart = period === 'WEEKLY' ? startOfWeek(now, { weekStartsOn: 1 }) : startOfMonth(now);
  const periodEnd = period === 'WEEKLY' ? endOfWeek(now, { weekStartsOn: 1 }) : endOfMonth(now);

  // Get all group members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          currentWeight: true,
          weightLogs: {
            where: {
              createdAt: {
                gte: periodStart,
                lte: periodEnd,
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  const leaderboardEntries = [];

  for (const member of members) {
    // Calculate activity score
    const posts = await prisma.groupPost.count({
      where: {
        groupId,
        userId: member.userId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const comments = await prisma.groupPostComment.count({
      where: {
        post: { groupId },
        userId: member.userId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const likes = await prisma.groupPostLike.count({
      where: {
        post: { groupId },
        userId: member.userId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const messages = await prisma.groupMessage.count({
      where: {
        groupId,
        userId: member.userId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const activityScore = posts * 10 + comments * 5 + likes * 2 + messages * 1;

    // Calculate weight loss score
    const weightLogs = member.user.weightLogs;
    let weightLossScore = 0;
    if (weightLogs.length >= 2) {
      const firstWeight = weightLogs[0].weight;
      const lastWeight = weightLogs[weightLogs.length - 1].weight;
      const weightLoss = firstWeight - lastWeight;
      weightLossScore = weightLoss > 0 ? weightLoss * 100 : 0;
    }

    // Calculate streak score (simplified - based on activity days)
    const activeDays = await prisma.groupPost.groupBy({
      by: ['createdAt'],
      where: {
        groupId,
        userId: member.userId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });
    const streakScore = activeDays.length * 5;

    // Calculate total score
    const totalScore = activityScore * 0.3 + weightLossScore * 0.5 + streakScore * 0.2;

    leaderboardEntries.push({
      groupId,
      userId: member.userId,
      period,
      periodStart,
      periodEnd,
      activityScore,
      weightLossScore,
      streakScore,
      totalScore,
      rank: 0, // Will be set after sorting
    });
  }

  // Sort by total score and assign ranks
  leaderboardEntries.sort((a, b) => b.totalScore - a.totalScore);
  leaderboardEntries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Upsert leaderboard entries
  for (const entry of leaderboardEntries) {
    await prisma.groupLeaderboard.upsert({
      where: {
        groupId_userId_period_periodStart: {
          groupId: entry.groupId,
          userId: entry.userId,
          period: entry.period,
          periodStart: entry.periodStart,
        },
      },
      update: {
        activityScore: entry.activityScore,
        weightLossScore: entry.weightLossScore,
        streakScore: entry.streakScore,
        totalScore: entry.totalScore,
        rank: entry.rank,
      },
      create: entry,
    });
  }

  // Send notifications to top 3
  const top3 = leaderboardEntries.slice(0, 3);
  for (const entry of top3) {
    await prisma.notification.create({
      data: {
        userId: entry.userId,
        type: 'GROUP_LEADERBOARD_RANK',
        title: 'Liderlik Tablosu',
        message: `Bu ${period === 'WEEKLY' ? 'hafta' : 'ay'} liderlik tablosunda ${entry.rank}. sıradasınız! 🎉`,
        actionUrl: `/groups/${groupId}/leaderboard`,
      },
    });
  }

  return leaderboardEntries.length;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active groups
    const groups = await prisma.group.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
      },
    });

    let totalUpdated = 0;

    // Update weekly and monthly leaderboards for all groups
    for (const group of groups) {
      const weeklyCount = await calculateLeaderboard(group.id, 'WEEKLY');
      const monthlyCount = await calculateLeaderboard(group.id, 'MONTHLY');
      totalUpdated += weeklyCount + monthlyCount;
    }

    return NextResponse.json({
      success: true,
      groupsProcessed: groups.length,
      entriesUpdated: totalUpdated,
    });
  } catch (error) {
    console.error('Leaderboard update cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
