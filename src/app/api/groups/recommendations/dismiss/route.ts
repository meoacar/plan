import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const dismissSchema = z.object({
  groupId: z.string().cuid(),
});

/**
 * POST /api/groups/recommendations/dismiss
 * Bir grup önerisini kapat (kullanıcıya bir daha gösterme)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { groupId } = dismissSchema.parse(body);

    // Dismissed recommendations tablosuna ekle
    // Not: Bu tablo henüz schema'da yok, basit bir çözüm olarak
    // kullanıcının metadata'sına veya ayrı bir tabloya kaydedilebilir
    
    // Şimdilik basit bir çözüm: ActivityLog'a kaydet (CACHE_CLEARED type'ını kullan)
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'CACHE_CLEARED', // Geçici olarak mevcut bir type kullanıyoruz
        targetId: groupId,
        targetType: 'GROUP_RECOMMENDATION',
        description: 'Grup önerisi kapatıldı',
        metadata: {
          groupId,
          dismissedAt: new Date().toISOString(),
          action: 'DISMISS_RECOMMENDATION',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Öneri kapatıldı',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Öneri kapatma hatası:', error);
    return NextResponse.json(
      { error: 'Öneri kapatılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
