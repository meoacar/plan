import { NextRequest, NextResponse } from 'next/server';
import { assignWeeklyQuestsToAllUsers } from '@/lib/quest-system';

/**
 * Haftalık Görev Atama Cron Job
 * 
 * Her Pazartesi saat 00:00'da çalışır
 * Tüm kullanıcılara yeni haftalık görevler atar
 * 
 * Requirements: 1.1, 1.5, 2.5
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

    console.log('Haftalık görev atama cron job başlatıldı...');

    const result = await assignWeeklyQuestsToAllUsers();

    return NextResponse.json({
      success: true,
      message: 'Haftalık görevler başarıyla atandı',
      stats: {
        totalUsers: result.total,
        successful: result.successCount,
        failed: result.errorCount,
      },
    });
  } catch (error) {
    console.error('Haftalık görev atama cron job hatası:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
