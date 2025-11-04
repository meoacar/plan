import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseReward } from '@/lib/reward-system';

/**
 * POST /api/shop/purchase
 * Ödül satın alır
 * 
 * Body:
 * - rewardId: string
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
    const { rewardId } = body;

    // Validasyon
    if (!rewardId) {
      return NextResponse.json(
        { error: 'Ödül ID gereklidir' },
        { status: 400 }
      );
    }

    // Ödül satın alma
    const result = await purchaseReward(session.user.id, rewardId);

    // TODO: Bildirim sistemi entegrasyonu (Görev 19)
    // Başarılı satın alma bildirimi oluşturulacak

    return NextResponse.json({
      success: true,
      data: {
        userReward: {
          id: result.userReward.id,
          rewardId: result.userReward.rewardId,
          reward: {
            id: result.userReward.reward.id,
            name: result.userReward.reward.name,
            description: result.userReward.reward.description,
            type: result.userReward.reward.type,
            imageUrl: result.userReward.reward.imageUrl,
          },
          coinsPaid: result.userReward.coinsPaid,
          purchasedAt: result.userReward.purchasedAt,
          isUsed: result.userReward.isUsed,
          rewardData: result.userReward.rewardData,
        },
        remainingCoins: result.remainingCoins,
      },
      message: 'Ödül başarıyla satın alındı',
    });
  } catch (error) {
    console.error('Ödül satın alma hatası:', error);
    
    // Hata mesajını kullanıcı dostu hale getir
    let errorMessage = 'Ödül satın alınırken bir hata oluştu';
    let statusCode = 500;

    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes('bulunamadı')) {
        errorMessage = message;
        statusCode = 404;
      } else if (message.includes('stokta yok') || message.includes('aktif değil')) {
        errorMessage = message;
        statusCode = 400;
      } else if (message.includes('Yetersiz coin') || message.includes('zaten sahipsiniz')) {
        errorMessage = message;
        statusCode = 400;
      } else {
        errorMessage = message;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: statusCode }
    );
  }
}
