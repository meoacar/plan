import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/feed/following - Takip edilen kullanıcıların planlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Takip edilen kullanıcıların ID'lerini al
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json({
        plans: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    // Takip edilen kullanıcıların planlarını getir
    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where: {
          userId: { in: followingIds },
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.plan.count({
        where: {
          userId: { in: followingIds },
          status: 'APPROVED',
        },
      }),
    ]);

    return NextResponse.json({
      plans,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get following feed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
