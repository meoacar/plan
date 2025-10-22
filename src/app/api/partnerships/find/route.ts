// src/app/api/partnerships/find/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Partner arama
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const minWeight = searchParams.get('minWeight');
    const maxWeight = searchParams.get('maxWeight');
    const minGoal = searchParams.get('minGoal');
    const maxGoal = searchParams.get('maxGoal');

    // Mevcut partnerleri al
    const existingPartnerships = await prisma.accountabilityPartnership.findMany({
      where: {
        OR: [
          { requesterId: session.user.id },
          { partnerId: session.user.id },
        ],
        status: { in: ['PENDING', 'ACTIVE'] },
      },
      select: {
        requesterId: true,
        partnerId: true,
      },
    });

    const excludeIds = [
      session.user.id,
      ...existingPartnerships.map((p) =>
        p.requesterId === session.user.id ? p.partnerId : p.requesterId
      ),
    ];

    const where: any = {
      id: { notIn: excludeIds },
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (minWeight || maxWeight) {
      where.startWeight = {};
      if (minWeight) where.startWeight.gte = parseInt(minWeight);
      if (maxWeight) where.startWeight.lte = parseInt(maxWeight);
    }

    if (minGoal || maxGoal) {
      where.goalWeight = {};
      if (minGoal) where.goalWeight.gte = parseInt(minGoal);
      if (maxGoal) where.goalWeight.lte = parseInt(maxGoal);
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        startWeight: true,
        goalWeight: true,
        level: true,
        streak: true,
        _count: {
          select: {
            plans: true,
          },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
