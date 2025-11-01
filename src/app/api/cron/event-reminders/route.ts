import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addHours, differenceInHours, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { groupNotificationTemplates } from '@/lib/group-notifications';

export const dynamic = 'force-dynamic';

/**
 * Cron job: Etkinlik hatırlatmaları gönderir
 * Çalışma zamanı: Her gün 09:00
 * 
 * 24 saat içinde başlayacak etkinlikler için katılımcılara hatırlatma bildirimi gönderir.
 * Sadece "GOING" (Katılacak) durumundaki katılımcılara bildirim gönderilir.
 */
export async function GET(request: NextRequest) {
  try {
    // Cron job güvenliği için authorization header kontrolü
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gelecek 24 saat içinde başlayacak etkinlikleri bul
    const now = new Date();
    const tomorrow = addHours(now, 24);

    const upcomingEvents = await prisma.groupEvent.findMany({
      where: {
        startDate: {
          gte: now,
          lte: tomorrow,
        },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        participants: {
          where: {
            status: 'GOING', // Sadece katılacak olanlara bildirim gönder
          },
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    let notificationsSent = 0;
    let failedNotifications = 0;
    const processedEvents: string[] = [];

    // Her etkinlik için katılımcılara hatırlatma gönder
    for (const event of upcomingEvents) {
      const hoursUntil = differenceInHours(event.startDate, now);
      const eventDate = format(event.startDate, 'dd MMMM yyyy, HH:mm', { locale: tr });

      // Bildirim şablonunu kullan
      const notification = groupNotificationTemplates.eventReminder(
        event.title,
        hoursUntil
      );

      // Her katılımcıya bildirim gönder
      for (const participant of event.participants) {
        try {
          await prisma.notification.create({
            data: {
              userId: participant.userId,
              type: 'GROUP_EVENT_REMINDER',
              title: notification.title,
              message: `${notification.message}\n📅 ${eventDate}\n📍 ${event.location || 'Konum belirtilmemiş'}`,
              actionUrl: `/groups/${event.group.slug}/events/${event.id}`,
              relatedId: event.id,
              metadata: {
                groupId: event.group.id,
                groupName: event.group.name,
                eventId: event.id,
                eventTitle: event.title,
                eventStartDate: event.startDate.toISOString(),
                hoursUntil,
              },
            },
          });
          notificationsSent++;
        } catch (error) {
          console.error(
            `Bildirim gönderilemedi (eventId: ${event.id}, userId: ${participant.userId}):`,
            error
          );
          failedNotifications++;
        }
      }

      processedEvents.push(event.id);
    }

    const response = {
      success: true,
      eventsProcessed: upcomingEvents.length,
      notificationsSent,
      failedNotifications,
      processedEventIds: processedEvents,
      timestamp: new Date().toISOString(),
    };

    console.log('Event reminders cron completed:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Event reminders cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
