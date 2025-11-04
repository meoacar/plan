import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { activateReward } from '@/lib/reward-system';

/**
 * POST /api/shop/activate
 * Ödülü aktifleştirir
 * 
 * Body:
 * - userRewardId: string
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
    const { userRewardId } = body;

    // Validasyon
    if (!userRewardId) {
      return NextResponse.json(
        { error: 'Ödül ID gereklidir' },
        { status: 400 }
      );
    }

    // Ödülü aktifleştir
    const result = await activateReward(session.user.id, userRewardId);

    // TODO: Bildirim sistemi entegrasyonu (Görev 19)
    // Başarılı aktivasyon bildirimi oluşturulacak

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message || 'Ödül başarıyla aktifleştirildi',
    });
  } catch (error) {
    console.error('Ödül aktivasyon hatası:', error);
    
    // Hata mesajını kullanıcı dostu hale getir
    let errorMessage = 'Ödül aktifleştirilirken bir hata oluştu';
    let statusCode = 500;

    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes('bulunamadı')) {
        errorMessage = message;
        statusCode = 404;
      } else if (message.includes('ait değil') || message.includes('zaten kullanılmış') || message.includes('süresi dolmuş')) {
        errorMessage = message;
        statusCode = 400;
      } else if (message.includes('Geçersiz ödül tipi')) {
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
