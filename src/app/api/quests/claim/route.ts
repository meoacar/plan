import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { claimQuestReward } from '@/lib/quest-system';
import { z } from 'zod';

/**
 * POST /api/quests/claim
 * Görev ödülünü talep eder
 */

// Request body validasyon şeması
const claimRequestSchema = z.object({
  questId: z.string().min(1, 'Görev ID gerekli'),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Request body'yi parse et
    const body = await request.json();
    
    // Validasyon
    const validation = claimRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Geçersiz istek',
          details: validation.error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    const { questId } = validation.data;

    // Ödülü talep et
    const result = await claimQuestReward(questId, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ödül talep edilemedi' },
        { status: 400 }
      );
    }

    // Kullanıcının güncel bilgilerini al (yeni seviye kontrolü için)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { level: true, xp: true, coins: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        coins: result.rewards.coins,
        xp: result.rewards.xp,
        newLevel: user?.level,
        totalCoins: user?.coins,
        totalXp: user?.xp,
      },
      message: 'Ödül başarıyla alındı!',
    });
  } catch (error) {
    console.error('Ödül talep etme hatası:', error);

    // Özel hata mesajları
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      if (errorMessage.includes('bulunamadı')) {
        return NextResponse.json(
          { error: 'Görev bulunamadı' },
          { status: 404 }
        );
      }
      
      if (errorMessage.includes('ait değil')) {
        return NextResponse.json(
          { error: 'Bu görev size ait değil' },
          { status: 403 }
        );
      }
      
      if (errorMessage.includes('tamamlanmadı')) {
        return NextResponse.json(
          { error: 'Görev henüz tamamlanmadı' },
          { status: 400 }
        );
      }
      
      if (errorMessage.includes('zaten alındı')) {
        return NextResponse.json(
          { error: 'Ödül zaten alındı' },
          { status: 400 }
        );
      }
      
      if (errorMessage.includes('süresi doldu')) {
        return NextResponse.json(
          { error: 'Görev süresi doldu' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Ödül talep edilirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
