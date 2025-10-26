import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// SSE için özel response oluştur
function createSSEResponse() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Heartbeat - bağlantıyı canlı tut
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000); // Her 30 saniyede bir

      // Cleanup
      return () => {
        clearInterval(heartbeat);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();

    // Son bildirim ID'sini al
    const lastNotification = await prisma.notification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    let lastNotificationId = lastNotification?.id || '';

    const stream = new ReadableStream({
      async start(controller) {
        // İlk bağlantıda okunmamış sayısını gönder
        const initialCount = await prisma.notification.count({
          where: {
            userId,
            isRead: false,
          },
        });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'count', count: initialCount })}\n\n`)
        );

        // Polling - her 5 saniyede bir yeni bildirim kontrolü
        const pollInterval = setInterval(async () => {
          try {
            // Yeni bildirimler var mı kontrol et
            const newNotifications = await prisma.notification.findMany({
              where: {
                userId,
                createdAt: {
                  gt: lastNotificationId
                    ? (await prisma.notification.findUnique({
                        where: { id: lastNotificationId },
                        select: { createdAt: true },
                      }))?.createdAt || new Date(0)
                    : new Date(0),
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            });

            if (newNotifications.length > 0) {
              // Son bildirim ID'sini güncelle
              lastNotificationId = newNotifications[0].id;

              // Yeni bildirimleri gönder
              for (const notification of newNotifications) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'new', notification })}\n\n`
                  )
                );
              }

              // Güncel okunmamış sayısını gönder
              const unreadCount = await prisma.notification.count({
                where: {
                  userId,
                  isRead: false,
                },
              });

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'count', count: unreadCount })}\n\n`
                )
              );
            }
          } catch (error) {
            console.error('SSE polling error:', error);
          }
        }, 5000); // Her 5 saniyede bir kontrol

        // Heartbeat - bağlantıyı canlı tut
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'));
          } catch (error) {
            clearInterval(heartbeat);
            clearInterval(pollInterval);
          }
        }, 30000);

        // Cleanup fonksiyonu
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          clearInterval(heartbeat);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Nginx için buffering'i kapat
      },
    });
  } catch (error) {
    console.error('SSE error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Edge runtime kullan (daha iyi SSE desteği)
export const runtime = 'edge';
