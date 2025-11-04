import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GamesClient } from './games-client';

export const metadata: Metadata = {
  title: 'Mini Oyunlar | Zayıflama Planım',
  description: 'Eğlenceli mini oyunlar oyna, coin kazan ve liderlik tablosunda yüksel!',
};

export default async function GamesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Kullanıcı bilgilerini getir
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      image: true,
      coins: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Aktif oyunları getir
  const games = await prisma.miniGame.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Bugünün başlangıcı
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Kullanıcının bugünkü oyun sayılarını hesapla
  const todaySessions = await prisma.gameSession.findMany({
    where: {
      userId: user.id,
      startedAt: {
        gte: today,
      },
      completed: true,
    },
    select: {
      gameId: true,
    },
  });

  const dailyPlays: Record<string, number> = {};
  todaySessions.forEach((session) => {
    dailyPlays[session.gameId] = (dailyPlays[session.gameId] || 0) + 1;
  });

  // Kullanıcının en yüksek skorlarını getir
  const highScoreSessions = await prisma.gameSession.findMany({
    where: {
      userId: user.id,
      completed: true,
    },
    select: {
      gameId: true,
      score: true,
    },
    orderBy: {
      score: 'desc',
    },
  });

  const highScores: Record<string, number> = {};
  highScoreSessions.forEach((session) => {
    if (!highScores[session.gameId] || session.score > highScores[session.gameId]) {
      highScores[session.gameId] = session.score;
    }
  });

  return (
    <GamesClient
      user={user}
      games={games}
      dailyPlays={dailyPlays}
      highScores={highScores}
    />
  );
}
