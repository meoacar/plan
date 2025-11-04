import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GameType } from '@prisma/client';
import { 
  startGameSession,
  GAME_ERROR_MESSAGES 
} from '@/lib/game-system';

/**
 * POST /api/games/start
 * Oyun oturumu başlatır
 * 
 * Body: { gameCode: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameCode } = body;

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

    // Oyun oturumu başlat
    const gameSession = await startGameSession(
      session.user.id,
      gameCode as GameType
    );

    return NextResponse.json({
      success: true,
      data: gameSession,
    });
  } catch (error) {
    console.error('Oyun başlatma hatası:', error);
    
    // Hata mesajlarını kontrol et
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // Günlük limit hatası
    if (errorMessage === GAME_ERROR_MESSAGES.GAME_LIMIT_REACHED) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 429 } // Too Many Requests
      );
    }

    return NextResponse.json(
      { 
        error: 'Oyun başlatılırken bir hata oluştu',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
