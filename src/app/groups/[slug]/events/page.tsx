import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EventList from '@/components/groups/events/event-list';
import EventCalendar from '@/components/groups/events/event-calendar';
import Link from 'next/link';
import { Calendar, List, Plus } from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    view?: 'list' | 'calendar';
    filter?: 'upcoming' | 'past' | 'all';
  };
}

async function getGroup(slug: string, userId?: string) {
  const group = await prisma.group.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      isPrivate: true,
    },
  });

  if (!group) {
    return null;
  }

  // Grup onaylı değilse ve kullanıcı admin değilse gösterme
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  if (group.status !== 'APPROVED' && user?.role !== 'ADMIN') {
    return null;
  }

  // Kullanıcının üyelik durumunu kontrol et
  let isMember = false;
  let memberRole: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null = null;
  if (userId) {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId,
        },
      },
    });
    isMember = !!membership;
    memberRole = membership?.role || null;
  }

  return {
    ...group,
    isMember,
    memberRole,
  };
}

async function getEventsForCalendar(groupId: string) {
  const events = await prisma.groupEvent.findMany({
    where: { groupId },
    select: {
      id: true,
      title: true,
      startDate: true,
      eventType: true,
    },
    orderBy: { startDate: 'asc' },
  });

  return events;
}

export async function generateMetadata({ params }: PageProps) {
  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  });

  if (!group) {
    return {
      title: 'Grup Bulunamadı',
    };
  }

  return {
    title: `${group.name} - Etkinlikler - Zayıflama Planım`,
    description: `${group.name} grubunun etkinliklerini görüntüleyin`,
  };
}

export default async function EventsPage({ params, searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/groups/${params.slug}/events`);
  }

  const group = await getGroup(params.slug, session.user.id);

  if (!group) {
    notFound();
  }

  // Üye değilse erişim engelle
  if (!group.isMember) {
    redirect(`/groups/${params.slug}`);
  }

  const activeView = searchParams.view || 'list';
  const activeFilter = searchParams.filter || 'upcoming';

  // Takvim görünümü için tüm etkinlikleri al
  const calendarEvents = activeView === 'calendar' ? await getEventsForCalendar(group.id) : [];

  // Kullanıcı etkinlik oluşturabilir mi?
  const canCreateEvent = group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href={`/groups/${params.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Gruba Dön
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
              <p className="text-gray-600 mt-1">
                Grup etkinliklerini görüntüleyin ve katılın
              </p>
            </div>
            {canCreateEvent && (
              <Link
                href={`/groups/${params.slug}/events/create`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Etkinlik Oluştur
              </Link>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <Link
                href={`/groups/${params.slug}/events?view=list&filter=${activeFilter}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeView === 'list'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Liste
              </Link>
              <Link
                href={`/groups/${params.slug}/events?view=calendar`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Takvim
              </Link>
            </div>

            {/* Filter (only for list view) */}
            {activeView === 'list' && (
              <div className="flex gap-2">
                <Link
                  href={`/groups/${params.slug}/events?view=list&filter=upcoming`}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeFilter === 'upcoming'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Yaklaşan
                </Link>
                <Link
                  href={`/groups/${params.slug}/events?view=list&filter=past`}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeFilter === 'past'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Geçmiş
                </Link>
                <Link
                  href={`/groups/${params.slug}/events?view=list&filter=all`}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Tümü
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeView === 'list' ? (
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Etkinlikler yükleniyor...</p>
              </div>
            }
          >
            <EventList
              groupId={group.id}
              groupSlug={group.slug}
              filter={activeFilter as 'upcoming' | 'past' | 'all'}
            />
          </Suspense>
        ) : (
          <EventCalendar events={calendarEvents} groupSlug={group.slug} />
        )}
      </div>
    </div>
  );
}
