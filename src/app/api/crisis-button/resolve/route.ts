import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Anti-abuse kontrolleri
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Bugün çözülen kriz sayısını kontrol et
    const todayResolvedCount = await prisma.crisisButton.count({
      where: {
        userId: session.user.id,
        resolved: true,
        resolvedAt: { gte: oneDayAgo },
      },
    });

    // Son çözülen krizi kontrol et (1 saat kuralı)
    const lastResolved = await prisma.crisisButton.findFirst({
      where: {
        userId: session.user.id,
        resolved: true,
        resolvedAt: { gte: oneHourAgo },
      },
      orderBy: { resolvedAt: 'desc' },
    });

    // Krizi çözüldü olarak işaretle
    await prisma.crisisButton.update({
      where: { id: latestCrisis.id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    // XP hesaplama ve verme
    let xpReward = 0;
    let message = 'Kriz başarıyla atlatıldı!';

    // Günlük limit: 5 kriz çözümü
    if (todayResolvedCount >= 5) {
      message = 'Kriz atlatıldı! (Günlük XP limitine ulaştın)';
    }
    // 1 saat kuralı
    else if (lastResolved) {
      const minutesSinceLastResolve = Math.floor(
        (now.getTime() - lastResolved.resolvedAt!.getTime()) / (60 * 1000)
      );
      message = `Kriz atlatıldı! (XP için ${60 - minutesSinceLastResolve} dakika bekle)`;
    }
    // XP ver - azalan ödül sistemi
    else {
      // İlk kriz: 50 XP, sonrakiler azalır (50, 40, 30, 20, 10)
      const baseXP = 50;
      xpReward = Math.max(10, baseXP - (todayResolvedCount * 10));

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
        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        if (newLevel > user.level) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { level: newLevel },
          });
        }
      }

      message = `Kriz başarıyla atlatıldı! +${xpReward} XP kazandın!`;
    }

    return NextResponse.json({
      success: true,
      xpReward,
      message,
      dailyCount: todayResolvedCount + 1,
      dailyLimit: 5,
    });
  } catch (error) {
    console.error('Kriz çözümü kaydedilemedi:', error);
    return NextResponse.json(
      { error: 'Kriz çözümü kaydedilemedi' },
      { status: 500 }
    );
  }
}
