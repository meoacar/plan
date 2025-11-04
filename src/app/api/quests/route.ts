import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserActiveQuests } from '@/lib/quest-system';

/**
 * GET /api/quests
 * Kullanıcının aktif görevlerini getirir
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

    const quests = await getUserActiveQuests(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        daily: quests.daily,
        weekly: quests.weekly,
        special: quests.special,
      },
    });
  } catch (error) {
    console.error('Görevleri getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Görevler yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
