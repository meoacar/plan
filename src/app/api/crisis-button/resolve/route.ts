import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trigger } = await req.json();

    // Son çözülmemiş kriz anını bul ve çözüldü olarak işaretle
    const latestCrisis = await prisma.crisisButton.findFirst({
      where: {
        userId: session.user.id,
        trigger,
        resolved: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestCrisis) {
      return NextResponse.json(
        { error: 'Çözülecek kriz anı bulunamadı' },
        { status: 404 }
      );
    }

    // Krizi çözüldü olarak işaretle
    await prisma.crisisButton.update({
      where: { id: latestCrisis.id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    // Kullanıcıya XP ver (gamification)
    const xpReward = 50;
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: { increment: xpReward },
      },
    });

    // Seviye kontrolü yap
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true },
    });

    if (user) {
      const newLevel = Math.floor(user.xp / 1000) + 1;
      if (newLevel > user.level) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { level: newLevel },
        });
      }
    }

    return NextResponse.json({
      success: true,
      xpReward,
      message: 'Kriz başarıyla atlatıldı!',
    });
  } catch (error) {
    console.error('Kriz çözümü kaydedilemedi:', error);
    return NextResponse.json(
      { error: 'Kriz çözümü kaydedilemedi' },
      { status: 500 }
    );
  }
}
