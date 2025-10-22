import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        weightLogs: true,
        checkIns: true,
        plans: { where: { status: 'APPROVED' } },
        likes: true,
        comments: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ortalama kullanıcı istatistikleri
    const [avgWeightLogs, avgCheckIns, avgPlans, avgLikes, avgComments, totalUsers] = await Promise.all([
      prisma.weightLog.count(),
      prisma.checkIn.count(),
      prisma.plan.count({ where: { status: 'APPROVED' } }),
      prisma.like.count(),
      prisma.comment.count(),
      prisma.user.count(),
    ]);

    const avgPerUser = {
      weightLogs: avgWeightLogs / totalUsers,
      checkIns: avgCheckIns / totalUsers,
      plans: avgPlans / totalUsers,
      likes: avgLikes / totalUsers,
      comments: avgComments / totalUsers,
    };

    // Kilo kaybı hesapla
    const userWeightLoss = user.startWeight && user.weightLogs.length > 0
      ? user.startWeight - user.weightLogs[0].weight
      : 0;

    const data = [
      {
        metric: 'Kilo Kaybı (kg)',
        you: Math.round(userWeightLoss * 10) / 10,
        average: 8.5, // Ortalama kilo kaybı
      },
      {
        metric: 'Kilo Takibi',
        you: user.weightLogs.length,
        average: Math.round(avgPerUser.weightLogs),
      },
      {
        metric: 'Check-in',
        you: user.checkIns.length,
        average: Math.round(avgPerUser.checkIns),
      },
      {
        metric: 'Plan Sayısı',
        you: user.plans.length,
        average: Math.round(avgPerUser.plans * 10) / 10,
      },
      {
        metric: 'Beğeni',
        you: user.likes.length,
        average: Math.round(avgPerUser.likes),
      },
      {
        metric: 'Yorum',
        you: user.comments.length,
        average: Math.round(avgPerUser.comments),
      },
      {
        metric: 'Streak (gün)',
        you: user.streak,
        average: 12,
      },
      {
        metric: 'XP',
        you: user.xp,
        average: 450,
      },
    ];

    return NextResponse.json(data);
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison data' }, { status: 500 });
  }
}
