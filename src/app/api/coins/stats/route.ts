import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCoinStats } from '@/lib/coin-system';

/**
 * GET /api/coins/stats
 * Kullanıcının coin istatistiklerini getirir (günlük/haftalık/aylık)
 * 
 * Query parametreleri:
 * - period: 'daily' | 'weekly' | 'monthly' | 'all' (varsayılan: 'all')
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period');

    // Period validasyonu
    const validPeriods = ['daily', 'weekly', 'monthly', 'all'];
    const period = periodParam && validPeriods.includes(periodParam) 
      ? (periodParam as 'daily' | 'weekly' | 'monthly' | 'all')
      : 'all';

    // İstatistikleri getir
    const stats = await getCoinStats(session.user.id, period);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Coin istatistikleri getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'İstatistikler yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
