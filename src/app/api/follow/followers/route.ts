import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/follow/followers?userId=xxx - Kullanıcının takipçilerini getir
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Username veya ID ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { username: userId }
        ]
      },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: user.id },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
              xp: true,
              level: true,
              _count: {
                select: {
                  plans: true,
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({
        where: { followingId: user.id },
      }),
    ]);

    return NextResponse.json({
      followers: followers.map((f) => f.follower),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get followers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
