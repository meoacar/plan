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
    select: {
      role: true,
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
    userRole: membership.role,
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
          <div className="flex items-center gap-4 mb-4">
            <a
              href={`/groups/${params.slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Gruba Dön
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {data.group.name} - Sohbet
          </h1>
          <p className="mt-2 text-gray-600">
            Grup üyeleriyle gerçek zamanlı sohbet edin
          </p>
        </div>

        {/* Chat Container */}
        <div className="rounded-lg border bg-white shadow-lg" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
          <GroupChat
            groupId={data.group.id}
            groupSlug={params.slug}
            currentUserId={session.user.id}
            userRole={data.userRole}
            initialMessages={data.messages}
          />
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
