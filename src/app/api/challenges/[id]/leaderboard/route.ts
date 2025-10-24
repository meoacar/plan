import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leaderboard = await prisma.challengeLeaderboard.findMany({
      where: { challengeId: params.id },
      orderBy: { rank: 'asc' },
      take: 100,
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
