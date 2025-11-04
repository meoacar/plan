'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

/**
 * GameLeaderboard Bileşeni
 * 
 * Oyun liderlik tablosunu gösterir.
 * Günlük, haftalık ve tüm zamanlar için en yüksek skorları listeler.
 */

export interface GameLeaderboardProps {
  gameCode: string;
  period?: 'daily' | 'weekly' | 'all-time';
  limit?: number;
  showUserRank?: boolean;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage: string | null;
  score: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank?: number;
}

// Periyot etiketleri
const PERIOD_LABELS: Record<string, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  'all-time': 'Tüm Zamanlar',
};

// Periyot ikonları
const PERIOD_ICONS: Record<string, any> = {
  daily: Target,
  weekly: TrendingUp,
  'all-time': Trophy,
};

export default function GameLeaderboard({
  gameCode,
  period = 'all-time',
  limit = 50,
  showUserRank = true,
}: GameLeaderboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [gameCode, period, limit]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        gameCode,
        period,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/games/leaderboard?${params}`);

      if (!response.ok) {
        throw new Error('Liderlik tablosu yüklenemedi');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Liderlik tablosu yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sıralama badge'i
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
          <Trophy className="w-5 h-5 text-white" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full">
          <Medal className="w-5 h-5 text-white" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full">
          <Award className="w-5 h-5 text-white" />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full">
        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
          #{rank}
        </span>
      </div>
    );
  };

  // Kullanıcı adının ilk harfi
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const PeriodIcon = PERIOD_ICONS[period];

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Spinner className="w-8 h-8" />
          <p className="text-gray-600 dark:text-gray-400">Liderlik tablosu yükleniyor...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Hata</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (!data || data.leaderboard.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            Henüz liderlik tablosunda kimse yok
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            İlk oynayan siz olun!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PeriodIcon className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Liderlik Tablosu</h3>
              <p className="text-sm text-blue-100">{PERIOD_LABELS[period]}</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {data.leaderboard.length} Oyuncu
          </Badge>
        </div>
      </div>

      {/* Liderlik listesi */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {data.leaderboard.map((entry, index) => {
          const isTopThree = entry.rank <= 3;
          const isUser = showUserRank && entry.rank === data.userRank;

          return (
            <div
              key={entry.userId}
              className={`p-4 flex items-center gap-4 transition-colors ${
                isUser
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                  : isTopThree
                  ? 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {/* Sıralama */}
              <div className="flex-shrink-0">
                {getRankBadge(entry.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700">
                <AvatarImage src={entry.userImage || undefined} alt={entry.userName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {getInitials(entry.userName)}
                </AvatarFallback>
              </Avatar>

              {/* Kullanıcı bilgisi */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold truncate ${isUser ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {entry.userName}
                  </p>
                  {isUser && (
                    <Badge variant="secondary" className="text-xs">
                      Siz
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  #{entry.rank} sırada
                </p>
              </div>

              {/* Skor */}
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  isTopThree 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {entry.score.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">puan</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kullanıcı sıralaması (listede yoksa) */}
      {showUserRank && data.userRank && data.userRank > limit && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Sizin Sıralamanız
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              #{data.userRank}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            İlk {limit} içine girmek için daha fazla oynayın!
          </p>
        </div>
      )}

      {/* Alt bilgi */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Liderlik tablosu her oyuncunun en yüksek skorunu gösterir
        </p>
      </div>
    </Card>
  );
}
