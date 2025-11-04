import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStreakStatus, getStreakHistory } from '@/lib/streak-bonus';

/**
 * GET /api/streak/status
 * 
 * Kullanıcının streak durumunu, bir sonraki milestone'u ve geçmişini getirir
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Streak durumunu al
    const status = await getStreakStatus(userId);

    // Streak geçmişini al (son 30 gün)
    const history = await getStreakHistory(userId);

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        history,
      },
    });
  } catch (error) {
    console.error('Streak status error:', error);
    return NextResponse.json(
      {
        error: 'Streak durumu alınırken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
