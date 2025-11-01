'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trophy, TrendingUp, Flame, Activity } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number | null;
  activityScore: number;
  weightLossScore: number;
  streakScore: number;
  totalScore: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  currentUserId?: string;
}

export function LeaderboardCard({ entry, currentUserId }: LeaderboardCardProps) {
  const isCurrentUser = currentUserId === entry.user.id;
  const rank = entry.rank || 0;

  // Sıralama için medal veya sıra numarası
  const getRankDisplay = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Sıralama için renk
  const getRankColor = () => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
        isCurrentUser ? 'ring-2 ring-primary-500 bg-primary-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Sıralama */}
        <div className={`text-3xl font-bold ${getRankColor()} min-w-[60px] text-center`}>
          {getRankDisplay()}
        </div>

        {/* Kullanıcı Bilgisi */}
        <div className="flex items-center gap-3 flex-1">
          <Link href={`/profile/${entry.user.username || entry.user.id}`}>
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {entry.user.image ? (
                <Image
                  src={entry.user.image}
                  alt={entry.user.name || 'Kullanıcı'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-semibold">
                  {entry.user.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1">
            <Link
              href={`/profile/${entry.user.username || entry.user.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {entry.user.name || 'İsimsiz Kullanıcı'}
              {isCurrentUser && (
                <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  Siz
                </span>
              )}
            </Link>
            <div className="text-sm text-gray-500">
              @{entry.user.username || entry.user.id.slice(0, 8)}
            </div>
          </div>
        </div>

        {/* Toplam Skor */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary-600 font-bold text-xl">
            <Trophy className="w-5 h-5" />
            {entry.totalScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">Toplam Puan</div>
        </div>
      </div>

      {/* Detaylı Skorlar */}
      <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold">
            <Activity className="w-4 h-4" />
            {entry.activityScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">Aktivite</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            {entry.weightLossScore.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Kilo Kaybı</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-600 font-semibold">
            <Flame className="w-4 h-4" />
            {entry.streakScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">Streak</div>
        </div>
      </div>
    </div>
  );
}
