import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Şehir bilgisi olan kullanıcıları al
    const users = await prisma.user.findMany({
      where: {
        city: { not: null },
        startWeight: { not: null },
      },
      select: {
        city: true,
        startWeight: true,
        weightLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Şehir bazında grupla
    const cityMap = new Map<string, { userCount: number; totalWeightLoss: number }>();

    users.forEach(user => {
      if (!user.city || !user.startWeight) return;

      const currentWeight = user.weightLogs[0]?.weight || user.startWeight;
      const weightLoss = user.startWeight - currentWeight;

      if (weightLoss <= 0) return; // Sadece kilo verenleri say

      const existing = cityMap.get(user.city) || { userCount: 0, totalWeightLoss: 0 };
      cityMap.set(user.city, {
        userCount: existing.userCount + 1,
        totalWeightLoss: existing.totalWeightLoss + weightLoss,
      });
    });

    // Veriyi formatlayıp sırala
    const cityData = Array.from(cityMap.entries())
      .map(([city, data]) => ({
        city,
        userCount: data.userCount,
        totalWeightLoss: Math.round(data.totalWeightLoss * 10) / 10,
        avgWeightLoss: Math.round((data.totalWeightLoss / data.userCount) * 10) / 10,
      }))
      .sort((a, b) => b.totalWeightLoss - a.totalWeightLoss);

    // Eğer veri yoksa mock data döndür
    if (cityData.length === 0) {
      return NextResponse.json([
        { city: 'İstanbul', userCount: 245, avgWeightLoss: 12.5, totalWeightLoss: 3062.5 },
        { city: 'Ankara', userCount: 156, avgWeightLoss: 11.8, totalWeightLoss: 1840.8 },
        { city: 'İzmir', userCount: 189, avgWeightLoss: 13.2, totalWeightLoss: 2494.8 },
        { city: 'Bursa', userCount: 98, avgWeightLoss: 10.5, totalWeightLoss: 1029 },
        { city: 'Antalya', userCount: 87, avgWeightLoss: 14.1, totalWeightLoss: 1226.7 },
        { city: 'Adana', userCount: 76, avgWeightLoss: 11.3, totalWeightLoss: 858.8 },
        { city: 'Konya', userCount: 65, avgWeightLoss: 9.8, totalWeightLoss: 637 },
        { city: 'Gaziantep', userCount: 54, avgWeightLoss: 10.2, totalWeightLoss: 550.8 },
      ]);
    }

    return NextResponse.json(cityData);
  } catch (error) {
    console.error('Weight map error:', error);
    return NextResponse.json({ error: 'Failed to fetch weight map data' }, { status: 500 });
  }
}
