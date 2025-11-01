import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Trophy, ArrowLeft } from 'lucide-react';
import { LeaderboardClient } from './leaderboard-client';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    period?: 'weekly' | 'monthly' | 'all_time';
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
    title: `${group.name} - Liderlik Tablosu - Zayıflama Planım`,
    description: `${group.name} grubunun liderlik tablosunu görüntüleyin`,
  };
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/groups/${params.slug}/leaderboard`);
  }

  const group = await getGroup(params.slug, session.user.id);

  if (!group) {
    notFound();
  }

  // Üye değilse erişim engelle
  if (!group.isMember) {
    redirect(`/groups/${params.slug}`);
  }

  const activePeriod = searchParams.period || 'weekly';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={`/groups/${params.slug}`}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{group.name}</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Liderlik Tablosu
              </h1>
              <p className="text-white/90">
                En aktif ve başarılı üyeleri keşfedin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Liderlik tablosu yükleniyor...</p>
            </div>
          }
        >
          <LeaderboardClient
            groupId={group.id}
            groupSlug={group.slug}
            initialPeriod={activePeriod}
          />
        </Suspense>
      </div>
    </div>
  );
}
