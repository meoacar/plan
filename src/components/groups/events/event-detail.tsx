import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import EventParticipants from './event-participants';

interface EventDetailProps {
  eventId: string;
  groupId: string;
  groupSlug: string;
}

const eventTypeConfig = {
  MEETUP: { label: 'Buluşma', color: 'bg-blue-100 text-blue-700' },
  WEBINAR: { label: 'Webinar', color: 'bg-purple-100 text-purple-700' },
  WORKSHOP: { label: 'Atölye', color: 'bg-green-100 text-green-700' },
  CHALLENGE: { label: 'Challenge', color: 'bg-yellow-100 text-yellow-700' },
  OTHER: { label: 'Diğer', color: 'bg-gray-100 text-gray-700' },
};

export default async function EventDetail({ eventId, groupId, groupSlug }: EventDetailProps) {
  const session = await auth();

  const event = await prisma.groupEvent.findUnique({
    where: { id: eventId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  if (!event || event.groupId !== groupId) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Etkinlik Bulunamadı</h3>
        <p className="text-gray-600">Bu etkinlik mevcut değil veya silinmiş.</p>
      </div>
    );
  }

  const typeConfig = eventTypeConfig[event.eventType as keyof typeof eventTypeConfig] || eventTypeConfig.OTHER;
  const isPast = new Date(event.startDate) < new Date();
  const isFull = event.maxParticipants && event._count.participants >= event.maxParticipants;

  const userParticipation = event.participants.find(
    (p) => p.userId === session?.user?.id
  );

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
              {isPast && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
                  Geçmiş Etkinlik
                </span>
              )}
              {isFull && !isPast && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-600">
                  Dolu
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            {event.description && (
              <p className="text-gray-700 text-lg whitespace-pre-wrap">{event.description}</p>
            )}
          </div>
        </div>

        {/* Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Başlangıç</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(event.startDate), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                </p>
              </div>
            </div>

            {event.endDate && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bitiş</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(event.endDate), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {event.location && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Konum</p>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Katılımcılar</p>
                <p className="font-semibold text-gray-900">
                  {event._count.participants} kişi
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Creator */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-3">Organizatör</p>
          <Link
            href={`/profile/${event.creator.username || event.creator.id}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
              {event.creator.image ? (
                <Image
                  src={event.creator.image}
                  alt={event.creator.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {event.creator.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {event.creator.name}
              </p>
              {event.creator.username && (
                <p className="text-sm text-gray-600">@{event.creator.username}</p>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Participants */}
      <EventParticipants
        eventId={eventId}
        groupId={groupId}
        groupSlug={groupSlug}
        participants={event.participants}
        userParticipation={userParticipation}
        isPast={isPast}
        isFull={isFull}
      />
    </div>
  );
}
