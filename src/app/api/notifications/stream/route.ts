import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Node.js runtime kullan
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();

    // Son kontrol edilen bildirim zamanı
    let lastCheck = new Date();

    const stream = new ReadableStream({
      async start(controller) {
        // İlk bağlantıda okunmamış sayısını gönder
        try {
          const initialCount = await prisma.notification.count({
            where: {
              userId,
              isRead: false,
            },
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'count', count: initialCount })}\n\n`)
          );
        } catch (error) {
          console.error('Initial count error:', error);
        }

        // Polling interval - her 3 saniyede bir kontrol et
        const pollInterval = setInterval(async () => {
          try {
            // Son kontrolden sonra oluşturulan bildirimleri al
            const newNotifications = await prisma.notification.findMany({
              where: {
                userId,
                createdAt: {
                  gt: lastCheck,
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            });

            if (newNotifications.length > 0) {
              // Son kontrol zamanını güncelle
              lastCheck = new Date();

              // Her yeni bildirim için mesaj gönder
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
        }, 3000); // Her 3 saniyede bir

        // Heartbeat - bağlantıyı canlı tut
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'));
          } catch (error) {
            clearInterval(heartbeat);
            clearInterval(pollInterval);
          }
        }, 15000); // Her 15 saniyede bir

        // Cleanup - bağlantı kapandığında
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          clearInterval(heartbeat);
          try {
            controller.close();
          } catch (error) {
            // Already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Nginx için
      },
    });
  } catch (error) {
    console.error('SSE error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
