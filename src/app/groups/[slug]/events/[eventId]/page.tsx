import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EventDetail from '@/components/groups/events/event-detail';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
    eventId: string;
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
      createdBy: true,
    },
  });

  if (!group) {
    return null;
  }

  // Grup onaylı değilse ve kullanıcı grup sahibi değilse gösterme
  if (group.status !== 'APPROVED' && group.createdBy !== userId) {
    return null;
  }

  // Kullanıcının üyelik durumunu kontrol et
  let isMember = false;
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
  }

  return {
    ...group,
    isMember,
  };
}

async function getEvent(eventId: string) {
  const event = await prisma.groupEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      groupId: true,
    },
  });

  return event;
}

export async function generateMetadata({ params }: PageProps) {
  const event = await getEvent(params.eventId);

  if (!event) {
    return {
      title: 'Etkinlik Bulunamadı',
    };
  }

  return {
    title: `${event.title} - Etkinlik Detayı - Zayıflama Planım`,
    description: `${event.title} etkinliğinin detaylarını görüntüleyin`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/groups/${params.slug}/events/${params.eventId}`);
  }

  const group = await getGroup(params.slug, session.user.id);

  if (!group) {
    notFound();
  }

  // Üye değilse erişim engelle
  if (!group.isMember) {
    redirect(`/groups/${params.slug}`);
  }

  // Etkinliğin bu gruba ait olduğunu kontrol et
  const event = await getEvent(params.eventId);
  if (!event || event.groupId !== group.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/groups/${params.slug}/events`}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Etkinliklere Dön
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlik Detayı</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Etkinlik yükleniyor...</p>
            </div>
          }
        >
          <EventDetail
            eventId={params.eventId}
            groupId={group.id}
            groupSlug={group.slug}
          />
        </Suspense>
      </div>
    </div>
  );
}
