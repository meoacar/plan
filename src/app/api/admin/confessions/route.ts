import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [confessions, total] = await Promise.all([
      prisma.confession.findMany({
        where: status !== 'ALL' ? { status: status as any } : undefined,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
              reactions: true,
            },
          },
        },
      }),
      prisma.confession.count({
        where: status !== 'ALL' ? { status: status as any } : undefined,
      }),
    ]);

    return NextResponse.json({
      confessions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin confession fetch error:', error);
    return NextResponse.json({ error: 'İtiraflar yüklenemedi' }, { status: 500 });
  }
}
