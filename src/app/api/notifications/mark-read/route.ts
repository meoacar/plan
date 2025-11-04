import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/notifications/mark-read
 * Bildirimi veya tüm bildirimleri okundu olarak işaretler
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Tüm bildirimleri okundu olarak işaretle
      await markAllNotificationsAsRead(session.user.id);
      return NextResponse.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId gerekli' },
        { status: 400 }
      );
    }

    // Bildirimin kullanıcıya ait olduğunu kontrol et
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu bildirimi işaretleme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Bildirimi okundu olarak işaretle
    await markNotificationAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bildirim işaretleme hatası:', error);
    return NextResponse.json(
      { error: 'Bildirim işaretlenemedi' },
      { status: 500 }
    );
  }
}
