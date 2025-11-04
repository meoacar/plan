import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateQuestProgress } from '@/lib/quest-system';
import { z } from 'zod';

/**
 * POST /api/quests/progress
 * Görev ilerlemesini günceller (internal kullanım)
 * 
 * Bu endpoint diğer API'lar tarafından kullanıcı aktiviteleri sonrası çağrılır.
 * Örnek: Plan oluşturma, beğeni, yorum vb.
 */

// Request body validasyon şeması
const progressRequestSchema = z.object({
  userId: z.string().min(1, 'Kullanıcı ID gerekli'),
  targetType: z.string().min(1, 'Hedef tipi gerekli'),
  incrementValue: z.number().int().positive().optional().default(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Bu endpoint internal kullanım için de açık olabilir
    // Ama güvenlik için session kontrolü yapıyoruz
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Request body'yi parse et
    const body = await request.json();
    
    // Validasyon
    const validation = progressRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Geçersiz istek',
          details: validation.error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    const { userId, targetType, incrementValue } = validation.data;

    // Güvenlik: Sadece kendi görevlerini güncelleyebilir
    // veya admin ise başkasının görevlerini güncelleyebilir
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = user?.role === 'ADMIN';
    const isSelf = session.user.id === userId;

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // İlerlemeyi güncelle
    const updatedQuests = await updateQuestProgress(
      userId,
      targetType,
      incrementValue
    );

    // Tamamlanan görevleri filtrele
    const completedQuests = updatedQuests.filter(q => q.completed && !q.rewardClaimed);

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updatedQuests.length,
        completedCount: completedQuests.length,
        updatedQuests: updatedQuests.map(q => ({
          id: q.id,
          questId: q.questId,
          title: q.quest.title,
          progress: q.progress,
          target: q.quest.targetValue,
          completed: q.completed,
          rewardClaimed: q.rewardClaimed,
        })),
      },
      message: completedQuests.length > 0 
        ? `${completedQuests.length} görev tamamlandı!` 
        : 'İlerleme güncellendi',
    });
  } catch (error) {
    console.error('Görev ilerleme güncelleme hatası:', error);
    
    return NextResponse.json(
      { 
        error: 'İlerleme güncellenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
