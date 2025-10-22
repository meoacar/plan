import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FollowList from '@/components/follow-list';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) {
    return { title: 'Kullanıcı Bulunamadı' };
  }

  return {
    title: `${user.name || 'Kullanıcı'} - Takipçiler`,
    description: `${user.name || 'Kullanıcı'} adlı kullanıcının takipçileri`,
  };
}

export default async function FollowersPage({ params }: PageProps) {
  const { userId } = await params
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {user.name || 'Kullanıcı'} - Takipçiler
          </h1>
          <p className="text-gray-600">Bu kullanıcıyı takip eden kişiler</p>
        </div>

        <FollowList userId={userId} type="followers" />
      </div>
    </div>
  );
}
