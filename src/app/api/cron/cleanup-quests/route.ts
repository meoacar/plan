import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredQuests } from '@/lib/quest-system';

/**
 * Süresi Dolan Görevleri Temizleme Cron Job
 * 
 * Her gün saat 01:00'da çalışır
 * Süresi dolmuş ve tamamlanmamış görevleri temizler
 * 
 * Requirements: 1.5, 2.5
 */
export async function GET(request: NextRequest) {
  try {
    // Cron secret kontrolü
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Süresi dolan görevleri temizleme cron job başlatıldı...');

    const deletedCount = await cleanupExpiredQuests();

    return NextResponse.json({
      success: true,
      message: 'Süresi dolan görevler temizlendi',
      deletedCount,
    });
  } catch (error) {
    console.error('Görev temizleme cron job hatası:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
