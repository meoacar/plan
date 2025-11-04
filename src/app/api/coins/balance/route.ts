import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBalance } from '@/lib/coin-system';

/**
 * GET /api/coins/balance
 * Kullanıcının coin bakiyesini getirir
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

    const coins = await getBalance(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        coins,
      },
    });
  } catch (error) {
    console.error('Coin bakiyesi getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Coin bakiyesi yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
