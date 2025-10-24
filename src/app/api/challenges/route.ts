import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active') === 'true';

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (active) {
      where.isActive = true;
      where.endDate = { gte: new Date() };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 20,
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Challenge listesi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
