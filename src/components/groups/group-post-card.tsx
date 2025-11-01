'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, TrendingUp, Trophy, Camera } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import PostComments from './post-comments';
import PostLikeButton from './post-like-button';

interface GroupPostCardProps {
  post: {
    id: string;
    content: string;
    imageUrl: string | null;
    postType: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      image: string | null;
      username: string | null;
    };
    isLiked: boolean;
    _count: {
      likes: number;
      comments: number;
    };
  };
  groupSlug: string;
  currentUserId?: string;
}

const postTypeConfig = {
  UPDATE: { label: 'Güncelleme', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  ACHIEVEMENT: { label: 'Başarı', icon: Trophy, color: 'bg-yellow-100 text-yellow-700' },
  MOTIVATION: { label: 'Motivasyon', icon: Heart, color: 'bg-red-100 text-red-700' },
  PROGRESS: { label: 'İlerleme', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
  PHOTO: { label: 'Fotoğraf', icon: Camera, color: 'bg-purple-100 text-purple-700' },
};

export default function GroupPostCard({ post, groupSlug, currentUserId }: GroupPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [commentCount, setCommentCount] = useState(post._count.comments);

  const typeConfig = postTypeConfig[post.postType as keyof typeof postTypeConfig] || postTypeConfig.UPDATE;
  const TypeIcon = typeConfig.icon;

  const handleLikeUpdate = (newIsLiked: boolean, newLikeCount: number) => {
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
  };

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <Link
            href={`/profile/${post.user.username || post.user.id}`}
            className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
              {post.user.image ? (
                <Image
                  src={post.user.image}
                  alt={post.user.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  {post.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                {post.user.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
              </p>
            </div>
          </Link>

          <span className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${typeConfig.color} flex-shrink-0`}>
            <TypeIcon className="w-3 h-3" />
            <span className="hidden xs:inline">{typeConfig.label}</span>
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap break-words">{post.content}</p>
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="relative w-full h-64 sm:h-80 md:h-96">
          <Image
            src={post.imageUrl}
            alt="Paylaşım görseli"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
        <div className="flex items-center gap-4 sm:gap-6">
          <PostLikeButton
            postId={post.id}
            groupSlug={groupSlug}
            initialIsLiked={isLiked}
            initialLikeCount={likeCount}
            onLikeUpdate={handleLikeUpdate}
            disabled={!currentUserId}
          />

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 active:text-purple-700 transition-colors group touch-manipulation min-h-[44px]"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm sm:text-base">{commentCount}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          <PostComments
            postId={post.id}
            groupSlug={groupSlug}
            currentUserId={currentUserId}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
}
