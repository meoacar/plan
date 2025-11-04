import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTransactionHistory } from '@/lib/coin-system';
import { CoinTransactionType } from '@prisma/client';

/**
 * GET /api/coins/transactions
 * Kullanıcının coin işlem geçmişini getirir (sayfalama ile)
 * 
 * Query parametreleri:
 * - type: 'EARNED' | 'SPENT' | 'BONUS' | 'REFUND' (opsiyonel)
 * - limit: number (varsayılan: 50)
 * - offset: number (varsayılan: 0)
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
    const typeParam = searchParams.get('type');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Parametreleri parse et
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    
    // Type validasyonu
    let type: CoinTransactionType | undefined;
    if (typeParam) {
      const validTypes = ['EARNED', 'SPENT', 'BONUS', 'REFUND'];
      if (validTypes.includes(typeParam)) {
        type = typeParam as CoinTransactionType;
      }
    }

    // Validasyon
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit 1-100 arasında olmalıdır' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset 0 veya daha büyük olmalıdır' },
        { status: 400 }
      );
    }

    // İşlem geçmişini getir
    const result = await getTransactionHistory(session.user.id, {
      type,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions: result.transactions,
        total: result.total,
        hasMore: result.hasMore,
        pagination: {
          limit,
          offset,
          nextOffset: result.hasMore ? offset + limit : null,
        },
      },
    });
  } catch (error) {
    console.error('Coin işlem geçmişi getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'İşlem geçmişi yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
