import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GroupChat } from '@/components/groups/chat/GroupChat';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getGroupAndMessages(slug: string, userId: string) {
  // Get group
  const group = await prisma.group.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  if (!group) {
    return null;
  }

  // Check if group is approved
  if (group.status !== 'APPROVED') {
    return null;
  }

  // Check if user is a member
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId,
      },
    },
  });

  if (!membership) {
    return null;
  }

  // Get last 50 messages
  const messages = await prisma.groupMessage.findMany({
    where: { groupId: group.id },
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
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return {
    group,
    messages: messages.reverse(), // Return in chronological order
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
    title: `${group.name} - Sohbet - Zayıflama Planım`,
    description: `${group.name} grubu sohbet odası`,
  };
}

export default async function GroupChatPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getGroupAndMessages(params.slug, session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {data.group.name} - Sohbet
          </h1>
          <p className="mt-2 text-gray-600">
            Grup üyeleriyle gerçek zamanlı sohbet edin
          </p>
        </div>

        {/* Chat Container */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-lg">
          <div className="h-[calc(100vh-300px)] min-h-[500px]">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                    <p className="text-gray-600">Sohbet yükleniyor...</p>
                  </div>
                </div>
              }
            >
              <GroupChat
                groupId={data.group.id}
                groupSlug={params.slug}
                currentUserId={session.user.id}
                initialMessages={data.messages}
              />
            </Suspense>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>İpucu:</strong> Mesajlarınız gerçek zamanlı olarak tüm
            çevrimiçi üyelere iletilir. Saygılı ve destekleyici bir dil
            kullanmayı unutmayın.
          </p>
        </div>
      </div>
    </div>
  );
}
