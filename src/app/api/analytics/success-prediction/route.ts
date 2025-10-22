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
        weightLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
        checkIns: { orderBy: { createdAt: 'desc' }, take: 30 },
        plans: { where: { status: 'APPROVED' } },
        badges: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Faktörleri hesapla
    const factors = [];
    let totalScore = 0;

    // 1. Düzenli kilo takibi (30%)
    const weightLogScore = Math.min((user.weightLogs.length / 10) * 100, 100);
    factors.push({
      name: 'Düzenli Kilo Takibi',
      score: Math.round(weightLogScore),
      weight: 0.3,
      description: `Son 10 günde ${user.weightLogs.length} kilo kaydı`,
    });
    totalScore += weightLogScore * 0.3;

    // 2. Check-in sıklığı (25%)
    const checkInScore = Math.min((user.checkIns.length / 30) * 100, 100);
    factors.push({
      name: 'Check-in Sıklığı',
      score: Math.round(checkInScore),
      weight: 0.25,
      description: `Son 30 günde ${user.checkIns.length} check-in`,
    });
    totalScore += checkInScore * 0.25;

    // 3. Streak (20%)
    const streakScore = Math.min((user.streak / 30) * 100, 100);
    factors.push({
      name: 'Süreklilik',
      score: Math.round(streakScore),
      weight: 0.2,
      description: `${user.streak} günlük seri`,
    });
    totalScore += streakScore * 0.2;

    // 4. Plan paylaşımı (15%)
    const planScore = Math.min((user.plans.length / 3) * 100, 100);
    factors.push({
      name: 'Topluluk Katılımı',
      score: Math.round(planScore),
      weight: 0.15,
      description: `${user.plans.length} plan paylaşımı`,
    });
    totalScore += planScore * 0.15;

    // 5. Rozet kazanımı (10%)
    const badgeScore = Math.min((user.badges.length / 5) * 100, 100);
    factors.push({
      name: 'Başarı Rozetleri',
      score: Math.round(badgeScore),
      weight: 0.1,
      description: `${user.badges.length} rozet kazanıldı`,
    });
    totalScore += badgeScore * 0.1;

    // Öneriler
    const recommendations = [];
    if (weightLogScore < 70) {
      recommendations.push('Her gün kilonu kaydet - düzenli takip başarının anahtarı');
    }
    if (checkInScore < 70) {
      recommendations.push('Günlük check-in yapmayı unutma - motivasyonunu yüksek tut');
    }
    if (streakScore < 50) {
      recommendations.push('Serini kırma! Ardışık günler başarı şansını artırır');
    }
    if (planScore < 50) {
      recommendations.push('Deneyimlerini paylaş - toplulukla etkileşim motive eder');
    }
    if (badgeScore < 50) {
      recommendations.push('Hedefleri tamamla ve rozet kazan - gamification motivasyonu artırır');
    }

    return NextResponse.json({
      successProbability: Math.round(totalScore),
      factors,
      recommendations,
    });
  } catch (error) {
    console.error('Success prediction error:', error);
    return NextResponse.json({ error: 'Failed to calculate prediction' }, { status: 500 });
  }
}
