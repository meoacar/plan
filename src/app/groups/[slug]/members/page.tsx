import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MemberList } from '@/components/groups/member-list';
import { JoinRequestList } from '@/components/groups/join-request-list';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    view?: 'members' | 'requests';
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
      _count: {
        select: {
          members: true,
        },
      },
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
    title: `${group.name} - Üyeler - Zayıflama Planım`,
    description: `${group.name} grubunun üyelerini görüntüleyin`,
  };
}

export default async function MembersPage({ params, searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/groups/${params.slug}/members`);
  }

  const group = await getGroup(params.slug, session.user.id);

  if (!group) {
    notFound();
  }

  // Üye değilse erişim engelle
  if (!group.isMember) {
    redirect(`/groups/${params.slug}`);
  }

  const activeView = searchParams.view || 'members';

  // Bekleyen istek sayısını al (sadece admin ve moderatör için)
  let pendingRequestsCount = 0;
  if (group.memberRole && group.memberRole !== 'MEMBER') {
    pendingRequestsCount = await prisma.groupJoinRequest.count({
      where: {
        groupId: group.id,
        status: 'PENDING',
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/groups/${params.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Gruba Dön
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                Üye Yönetimi
              </h1>
              <p className="text-gray-600 mt-1">
                Toplam {group._count.members} üye
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <Link
              href={`/groups/${params.slug}/members?view=members`}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'members'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Üyeler
            </Link>
            {group.memberRole && group.memberRole !== 'MEMBER' && (
              <Link
                href={`/groups/${params.slug}/members?view=requests`}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeView === 'requests'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Katılma İstekleri
                {pendingRequestsCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeView === 'members' && (
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Üyeler yükleniyor...</p>
              </div>
            }
          >
            <MemberList
              groupId={group.id}
              groupSlug={group.slug}
              currentUserId={session.user.id}
              currentUserRole={group.memberRole!}
            />
          </Suspense>
        )}

        {activeView === 'requests' &&
          group.memberRole &&
          group.memberRole !== 'MEMBER' && (
            <Suspense
              fallback={
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-4 text-gray-600">İstekler yükleniyor...</p>
                </div>
              }
            >
              <JoinRequestList
                groupId={group.id}
                groupSlug={group.slug}
                currentUserRole={group.memberRole}
              />
            </Suspense>
          )}
      </div>
    </div>
  );
}
