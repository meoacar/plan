import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export async function GET() {
  try {
    // Son 30 günün plan paylaşımlarını al
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const plans = await prisma.plan.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'APPROVED',
      },
      select: { createdAt: true },
    });

    // Gün ve saate göre grupla
    const heatmapData: { [key: string]: number } = {};

    plans.forEach(plan => {
      const date = new Date(plan.createdAt);
      const day = DAYS[date.getDay()];
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      
      heatmapData[key] = (heatmapData[key] || 0) + 1;
    });

    // Tüm gün ve saatler için veri oluştur
    const result = [];
    DAYS.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        result.push({
          day,
          hour,
          count: heatmapData[key] || 0,
        });
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Heatmap error:', error);
    return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 });
  }
}
