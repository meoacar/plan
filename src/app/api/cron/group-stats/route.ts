import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

async function calculateGroupStats(groupId: string) {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  // Get total members
  const totalMembers = await prisma.groupMember.count({
    where: { groupId },
  });

  // Get active members (posted, commented, or messaged in last 7 days)
  const activeMemberIds = new Set<string>();

  const activePosts = await prisma.groupPost.findMany({
    where: {
      groupId,
      createdAt: { gte: sevenDaysAgo },
    },
    select: { userId: true },
    distinct: ['userId'],
  });
  activePosts.forEach((p) => activeMemberIds.add(p.userId));

  const activeComments = await prisma.groupPostComment.findMany({
    where: {
      post: { groupId },
      createdAt: { gte: sevenDaysAgo },
    },
    select: { userId: true },
    distinct: ['userId'],
  });
  activeComments.forEach((c) => activeMemberIds.add(c.userId));

  const activeMessages = await prisma.groupMessage.findMany({
    where: {
      groupId,
      createdAt: { gte: sevenDaysAgo },
    },
    select: { userId: true },
    distinct: ['userId'],
  });
  activeMessages.forEach((m) => activeMemberIds.add(m.userId));

  const activeMembers = activeMemberIds.size;
  const activeRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

  // Calculate total weight loss
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        include: {
          weightLogs: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      },
    },
  });

  let totalWeightLoss = 0;
  let membersWithWeightLoss = 0;

  for (const member of members) {
    const firstLog = member.user.weightLogs[0];
    const currentWeight = member.user.currentWeight;

    if (firstLog && currentWeight) {
      const weightLoss = firstLog.weight - currentWeight;
      if (weightLoss > 0) {
        totalWeightLoss += weightLoss;
        membersWithWeightLoss++;
      }
    }
  }

  const avgWeightLoss = membersWithWeightLoss > 0 ? totalWeightLoss / membersWithWeightLoss : 0;

  // Get total posts and messages
  const totalPosts = await prisma.groupPost.count({
    where: { groupId },
  });

  const totalMessages = await prisma.groupMessage.count({
    where: { groupId },
  });

  // Update group stats
  await prisma.groupStats.upsert({
    where: { groupId },
    update: {
      totalMembers,
      activeMembers,
      totalWeightLoss,
      avgWeightLoss,
      totalPosts,
      totalMessages,
      activeRate,
    },
    create: {
      groupId,
      totalMembers,
      activeMembers,
      totalWeightLoss,
      avgWeightLoss,
      totalPosts,
      totalMessages,
      activeRate,
    },
  });

  // Save to history
  await prisma.groupStatsHistory.create({
    data: {
      groupId,
      date: now,
      activeMembers,
      totalWeightLoss,
      postsCount: totalPosts,
      messagesCount: totalMessages,
    },
  });

  return {
    totalMembers,
    activeMembers,
    totalWeightLoss,
    avgWeightLoss,
  };
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
        name: true,
      },
    });

    const results = [];

    for (const group of groups) {
      const stats = await calculateGroupStats(group.id);
      results.push({
        groupId: group.id,
        groupName: group.name,
        ...stats,
      });
    }

    return NextResponse.json({
      success: true,
      groupsProcessed: groups.length,
      results,
    });
  } catch (error) {
    console.error('Group stats cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
