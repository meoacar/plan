import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GameType } from '@prisma/client';
import { 
  getGameLeaderboard,
  GAME_ERROR_MESSAGES 
} from '@/lib/game-system';

/**
 * GET /api/games/leaderboard
 * Oyun liderlik tablosunu getirir
 * 
 * Query params:
 * - gameCode: string (required)
 * - period: 'daily' | 'weekly' | 'all-time' (default: 'all-time')
 * - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const gameCode = searchParams.get('gameCode');
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'all-time' || 'all-time';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50;

    // Validasyon
    if (!gameCode) {
      return NextResponse.json(
        { error: 'Oyun kodu gerekli' },
        { status: 400 }
      );
    }

    // Oyun kodu kontrolü
    if (!Object.values(GameType).includes(gameCode as GameType)) {
      return NextResponse.json(
        { error: GAME_ERROR_MESSAGES.INVALID_GAME_CODE },
        { status: 400 }
      );
    }

    // Period kontrolü
    if (!['daily', 'weekly', 'all-time'].includes(period)) {
      return NextResponse.json(
        { error: 'Geçersiz periyot. Kullanılabilir değerler: daily, weekly, all-time' },
        { status: 400 }
      );
    }

    // Liderlik tablosunu getir
    const leaderboard = await getGameLeaderboard(
      gameCode as GameType,
      period,
      limit
    );

    // Kullanıcının sıralamasını bul
    const userRank = leaderboard.find(
      (entry) => entry.userId === session.user.id
    )?.rank;

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        userRank: userRank || null,
        period,
        gameCode,
        total: leaderboard.length,
      },
    });
  } catch (error) {
    console.error('Liderlik tablosu getirme hatası:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // Oyun bulunamadı hatası
    if (errorMessage.includes('bulunamadı')) {
      return NextResponse.json(
        { error: GAME_ERROR_MESSAGES.GAME_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Liderlik tablosu yüklenirken bir hata oluştu',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
