import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GroupStats } from '@/components/groups/stats/group-stats';
import { StatsClient } from './stats-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface StatsPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    days?: string;
  };
}

export async function generateMetadata({
  params,
}: StatsPageProps): Promise<Metadata> {
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
    title: `${group.name} - İstatistikler`,
    description: `${group.name} grubunun detaylı istatistikleri ve ilerleme grafikleri`,
  };
}

export default async function StatsPage({
  params,
  searchParams,
}: StatsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Grubu getir
  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!group) {
    notFound();
  }

  // Kullanıcının grup üyesi olup olmadığını kontrol et
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: session.user.id,
      },
    },
  });

  if (!membership) {
    redirect(`/groups/${params.slug}`);
  }

  // Zaman aralığını al (varsayılan 30 gün)
  const days = searchParams.days ? parseInt(searchParams.days, 10) : 30;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/groups/${params.slug}`}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Gruba Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          {group.name} - İstatistikler
        </h1>
        <p className="mt-2 text-gray-600">
          Grubunuzun detaylı istatistiklerini ve ilerleme grafiklerini görüntüleyin
        </p>
      </div>

      {/* Filtreler */}
      <StatsClient groupId={group.id} initialDays={days} />

      {/* İstatistikler */}
      <GroupStats groupId={group.id} days={days} />
    </div>
  );
}
