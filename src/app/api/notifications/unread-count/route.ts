import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUnreadNotificationCount } from '@/lib/notification-service';

/**
 * GET /api/notifications/unread-count
 * Kullanıcının okunmamış bildirim sayısını getirir
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const count = await getUnreadNotificationCount(session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Okunmamış bildirim sayısı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sayı getirilemedi' },
      { status: 500 }
    );
  }
}
