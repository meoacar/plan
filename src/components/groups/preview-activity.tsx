'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageCircle, Heart, TrendingUp, Award, Sparkles, Image as ImageIcon } from 'lucide-react';

interface Activity {
  id: string;
  content: string;
  postType: string;
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

interface PreviewActivityProps {
  activities: Activity[];
}

const postTypeConfig = {
  UPDATE: { label: 'Güncelleme', icon: Sparkles, color: 'text-blue-600' },
  ACHIEVEMENT: { label: 'Başarı', icon: Award, color: 'text-yellow-600' },
  MOTIVATION: { label: 'Motivasyon', icon: Heart, color: 'text-pink-600' },
  PROGRESS: { label: 'İlerleme', icon: TrendingUp, color: 'text-green-600' },
  PHOTO: { label: 'Fotoğraf', icon: ImageIcon, color: 'text-purple-600' },
};

export default function PreviewActivity({ activities }: PreviewActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Henüz aktivite yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = postTypeConfig[activity.postType as keyof typeof postTypeConfig] || postTypeConfig.UPDATE;
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {activity.user.image ? (
                <Image
                  src={activity.user.image}
                  alt={activity.user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {activity.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900">
                  {activity.user.name}
                </span>
                <span className={`flex items-center gap-1 text-xs ${config.color}`}>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {activity.content}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {activity._count.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {activity._count.comments}
                </span>
                <span>
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
