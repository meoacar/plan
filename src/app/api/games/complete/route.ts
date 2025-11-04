import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  completeGameSession,
  GAME_ERROR_MESSAGES 
} from '@/lib/game-system';

/**
 * POST /api/games/complete
 * Oyun oturumunu tamamlar ve coin ödülü verir
 * 
 * Body: { 
 *   sessionId: string, 
 *   score: number,
 *   gameData?: any 
 * }
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
    const { sessionId, score, gameData } = body;

    // Validasyon
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Oturum ID gerekli' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Geçerli bir skor gerekli' },
        { status: 400 }
      );
    }

    // Oyun oturumunu tamamla
    const result = await completeGameSession(
      sessionId,
      score,
      gameData
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Oyun tamamlama hatası:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // Özel hata durumları
    if (errorMessage === GAME_ERROR_MESSAGES.GAME_SESSION_NOT_FOUND) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    if (errorMessage === GAME_ERROR_MESSAGES.GAME_ALREADY_COMPLETED) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { 
        error: 'Oyun tamamlanırken bir hata oluştu',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
