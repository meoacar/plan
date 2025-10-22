import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const [weightLogs, checkIns, plans, badges, progressPhotos] = await Promise.all([
      prisma.weightLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.checkIn.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.plan.findMany({
        where: { userId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
        take: 10,
      }),
      prisma.progressPhoto.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const events = [];

    // Kilo kayıtları
    weightLogs.forEach(log => {
      events.push({
        id: `weight-${log.id}`,
        type: 'weight_log',
        title: `${log.weight} kg`,
        description: log.note || 'Kilo kaydı eklendi',
        date: log.createdAt.toISOString(),
        icon: '⚖️',
        color: '#3b82f6',
      });
    });

    // Check-inler
    checkIns.forEach(checkIn => {
      events.push({
        id: `checkin-${checkIn.id}`,
        type: 'check_in',
        title: 'Günlük Check-in',
        description: checkIn.note || `Enerji: ${checkIn.energy}/5, Motivasyon: ${checkIn.motivation}/5`,
        date: checkIn.createdAt.toISOString(),
        icon: '✅',
        color: '#10b981',
      });
    });

    // Planlar
    plans.forEach(plan => {
      events.push({
        id: `plan-${plan.id}`,
        type: 'plan',
        title: 'Plan Paylaşıldı',
        description: plan.title,
        date: plan.createdAt.toISOString(),
        icon: '📝',
        color: '#8b5cf6',
      });
    });

    // Rozetler
    badges.forEach(badge => {
      events.push({
        id: `badge-${badge.id}`,
        type: 'badge',
        title: 'Rozet Kazanıldı',
        description: badge.badge.name,
        date: badge.earnedAt.toISOString(),
        icon: '🏆',
        color: '#f59e0b',
      });
    });

    // İlerleme fotoğrafları
    progressPhotos.forEach(photo => {
      events.push({
        id: `photo-${photo.id}`,
        type: 'photo',
        title: 'İlerleme Fotoğrafı',
        description: photo.description || `${photo.weight} kg`,
        date: photo.createdAt.toISOString(),
        icon: '📸',
        color: '#ec4899',
      });
    });

    // Tarihe göre sırala
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(events.slice(0, 50));
  } catch (error) {
    console.error('Timeline error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
