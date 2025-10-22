import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trigger, note } = await req.json();

    if (!trigger) {
      return NextResponse.json({ error: 'Trigger gerekli' }, { status: 400 });
    }

    const validTriggers = ['food_craving', 'motivation_low', 'stress_eating', 'boredom'];
    if (!validTriggers.includes(trigger)) {
      return NextResponse.json({ error: 'Geçersiz trigger' }, { status: 400 });
    }

    // Kriz anını kaydet
    const crisisButton = await prisma.crisisButton.create({
      data: {
        userId: session.user.id,
        trigger,
        note,
      },
    });

    return NextResponse.json({ success: true, id: crisisButton.id });
  } catch (error) {
    console.error('Kriz anı kaydedilemedi:', error);
    return NextResponse.json(
      { error: 'Kriz anı kaydedilemedi' },
      { status: 500 }
    );
  }
}

// Kriz anı geçmişini getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const resolved = searchParams.get('resolved');

    const where: any = {
      userId: session.user.id,
    };

    if (resolved !== null) {
      where.resolved = resolved === 'true';
    }

    const crisisButtons = await prisma.crisisButton.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // İstatistikler
    const stats = await prisma.crisisButton.groupBy({
      by: ['trigger'],
      where: { userId: session.user.id },
      _count: true,
    });

    const resolvedCount = await prisma.crisisButton.count({
      where: {
        userId: session.user.id,
        resolved: true,
      },
    });

    const totalCount = await prisma.crisisButton.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      crisisButtons,
      stats: {
        byTrigger: stats,
        resolved: resolvedCount,
        total: totalCount,
        successRate: totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Kriz anı geçmişi getirilemedi:', error);
    return NextResponse.json(
      { error: 'Kriz anı geçmişi getirilemedi' },
      { status: 500 }
    );
  }
}
