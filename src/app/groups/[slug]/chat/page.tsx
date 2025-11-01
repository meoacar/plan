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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-6xl">
          {/* Modern Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <a
                href={`/groups/${params.slug}`}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-purple-600 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Gruba Dön</span>
              </a>

              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-green-200 shadow-sm">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-sm font-semibold text-green-700">Canlı Sohbet</span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {data.group.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Grup üyeleriyle gerçek zamanlı sohbet edin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Chat Container */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative rounded-3xl border border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
              <GroupChat
                groupId={data.group.id}
                groupSlug={params.slug}
                currentUserId={session.user.id}
                userRole={data.userRole}
                initialMessages={data.messages}
              />
            </div>
          </div>

          {/* Modern Info Card */}
          <div className="mt-6 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-bold text-blue-700">İpucu:</span> Mesajlarınız gerçek zamanlı olarak tüm çevrimiçi üyelere iletilir. Saygılı ve destekleyici bir dil kullanmayı unutmayın. 💬
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
