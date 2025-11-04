import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GameType } from '@prisma/client';
import { 
  GAME_SETTINGS, 
  DAILY_GAME_LIMIT,
  getDailyGameStatus,
  getUserGameStats 
} from '@/lib/game-system';

/**
 * GET /api/games
 * Oyun listesini, kullanıcının günlük durumunu ve yüksek skorlarını getirir
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Tüm aktif oyunları getir
    const games = await prisma.miniGame.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        icon: true,
        settings: true,
        rewardTiers: true,
        dailyLimit: true,
        order: true,
      },
    });

    // Kullanıcının günlük oyun durumunu getir
    const dailyStatus = await getDailyGameStatus(userId);

    // Her oyun için kullanıcının istatistiklerini getir
    const gamesWithStats = await Promise.all(
      games.map(async (game) => {
        const stats = await getUserGameStats(userId, game.code as GameType);
        const status = dailyStatus.find((s) => s.gameCode === game.code);

        return {
          ...game,
          playedToday: status?.playedToday || 0,
          remainingPlays: status?.remainingPlays || DAILY_GAME_LIMIT,
          canPlay: status?.canPlay || true,
          highScore: stats.highScore,
          totalGames: stats.totalGames,
          averageScore: stats.averageScore,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        games: gamesWithStats,
        dailyLimit: DAILY_GAME_LIMIT,
      },
    });
  } catch (error) {
    console.error('Oyunları getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Oyunlar yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
