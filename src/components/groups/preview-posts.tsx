'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageCircle, Heart, TrendingUp, Award, Sparkles, Image as ImageIcon } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  postType: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface PreviewPostsProps {
  posts: Post[];
}

const postTypeConfig = {
  UPDATE: { label: 'Güncelleme', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50' },
  ACHIEVEMENT: { label: 'Başarı', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  MOTIVATION: { label: 'Motivasyon', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
  PROGRESS: { label: 'İlerleme', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  PHOTO: { label: 'Fotoğraf', icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
};

export default function PreviewPosts({ posts }: PreviewPostsProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Henüz popüler gönderi yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const config = postTypeConfig[post.postType as keyof typeof postTypeConfig] || postTypeConfig.UPDATE;
        const Icon = config.icon;

        return (
          <div
            key={post.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              {post.user.image ? (
                <Image
                  src={post.user.image}
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {post.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">
                  {post.user.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`flex items-center gap-1 ${config.color}`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
              {post.content}
            </p>

            {/* Image */}
            {post.imageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="font-semibold">{post._count.likes}</span>
                <span className="text-xs">beğeni</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{post._count.comments}</span>
                <span className="text-xs">yorum</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
