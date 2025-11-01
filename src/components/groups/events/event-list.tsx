import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import EventCard from './event-card';
import { Calendar } from 'lucide-react';

interface EventListProps {
  groupId: string;
  groupSlug: string;
  filter?: 'upcoming' | 'past' | 'all';
}

export default async function EventList({ groupId, groupSlug, filter = 'upcoming' }: EventListProps) {
  const session = await auth();

  let dateFilter = {};
  const now = new Date();

  if (filter === 'upcoming') {
    dateFilter = { startDate: { gte: now } };
  } else if (filter === 'past') {
    dateFilter = { startDate: { lt: now } };
  }

  const events = await prisma.groupEvent.findMany({
    where: {
      groupId,
      ...dateFilter,
    },
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
        where: session?.user?.id ? {
          userId: session.user.id,
        } : undefined,
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
    orderBy: { startDate: filter === 'past' ? 'desc' : 'asc' },
  });

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {filter === 'upcoming' ? 'Yaklaşan Etkinlik Yok' : 'Geçmiş Etkinlik Yok'}
        </h3>
        <p className="text-gray-600 mb-6">
          {filter === 'upcoming'
            ? 'Henüz planlanmış bir etkinlik bulunmuyor.'
            : 'Henüz geçmiş etkinlik bulunmuyor.'}
        </p>
      </div>
    );
  }

  const eventsWithStatus = events.map((event) => ({
    ...event,
    userParticipation: event.participants[0] || null,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventsWithStatus.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          groupId={groupId}
          groupSlug={groupSlug}
        />
      ))}
    </div>
  );
}
