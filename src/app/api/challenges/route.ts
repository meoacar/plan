import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, goalType, targetValue, groupId } = body;

    // Validation
    if (!title || !description || !startDate || !endDate || !goalType || !groupId) {
      return NextResponse.json({ error: 'Tüm alanları doldurun' }, { status: 400 });
    }

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Map goalType to ChallengeType enum
    const typeMap: Record<string, 'WEIGHT_LOSS' | 'ACTIVITY' | 'STREAK' | 'CHECK_IN' | 'RECIPE_SHARE' | 'PLAN_SHARE'> = {
      'weight-loss': 'WEIGHT_LOSS',
      'fitness': 'ACTIVITY',
      'healthy-eating': 'ACTIVITY',
      'muscle-gain': 'ACTIVITY',
    };

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type: typeMap[goalType] || 'WEIGHT_LOSS',
        target: targetValue ? parseFloat(targetValue) : 0,
        unit: 'kg',
        isActive: true,
        groupId,
        createdBy: session.user.id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Challenge oluşturma hatası:', error);
    return NextResponse.json({ error: 'Challenge oluşturulamadı' }, { status: 500 });
  }
}
