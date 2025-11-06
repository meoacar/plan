import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUnreadNotificationCount } from '@/lib/notification-service';

/**
 * GET /api/notifications/unread-count
 * Kullanıcının okunmamış bildirim sayısını getirir
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      // Yetkisiz kullanıcılar için 0 dön
      return NextResponse.json({ count: 0 });
    }

    const count = await getUnreadNotificationCount(session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Okunmamış bildirim sayısı getirme hatası:', error);
    // Hata durumunda 0 dön, UI'ı bozmayalım
    return NextResponse.json({ count: 0 });
  }
}
