import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import GroupPostCard from './group-post-card';
import CreatePostForm from './create-post-form';
import { WeeklyGoal } from './weekly-goals/weekly-goal';
import { Suspense } from 'react';

interface GroupFeedProps {
  groupSlug: string;
  groupId: string;
  isMember: boolean;
}

export default async function GroupFeed({ groupSlug, groupId, isMember }: GroupFeedProps) {
  const session = await auth();

  // İlk 20 paylaşımı getir
  const posts = await prisma.groupPost.findMany({
    where: {
      groupId,
    },
    take: 20,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      likes: session?.user
        ? {
            where: {
              userId: session.user.id,
            },
            select: {
              id: true,
            },
          }
        : false,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  // İsLiked alanını ekle
  const postsWithLikeStatus = posts.map((post) => ({
    ...post,
    isLiked: session?.user ? (post.likes as any[]).length > 0 : false,
    likes: undefined,
  }));

  const nextCursor = posts.length === 20 ? posts[posts.length - 1].id : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ana İçerik */}
      <div className="lg:col-span-2 space-y-6">
        {/* Paylaşım Oluşturma Formu */}
        {isMember && session?.user && (
          <CreatePostForm
            groupSlug={groupSlug}
            user={{
              id: session.user.id,
              name: session.user.name || '',
              image: session.user.image || null,
            }}
          />
        )}

        {/* Paylaşımlar */}
        {postsWithLikeStatus.length > 0 ? (
          <div className="space-y-4">
            {postsWithLikeStatus.map((post) => (
              <GroupPostCard
                key={post.id}
                post={post}
                groupSlug={groupSlug}
                currentUserId={session?.user?.id}
              />
            ))}
            {nextCursor && (
              <div className="text-center py-4">
                <button
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                  onClick={() => {
                    // Bu client component'te handle edilecek
                  }}
                >
                  Daha fazla yükle
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz paylaşım yok</h3>
            <p className="text-gray-600">
              {isMember
                ? 'İlk paylaşımı yapan siz olun!'
                : 'Paylaşımları görmek için gruba katılın.'}
            </p>
          </div>
        )}
      </div>

      {/* Yan Panel - Haftalık Hedef */}
      {isMember && session?.user && (
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Suspense
              fallback={
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              }
            >
              <WeeklyGoal groupId={groupId} userId={session.user.id} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
