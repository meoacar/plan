'use client';

import { useState, useEffect } from 'react';
import { LeaderboardCard } from '@/components/groups/leaderboard/leaderboard-card';
import { LeaderboardFilters } from '@/components/groups/leaderboard/leaderboard-filters';
import { LeaderboardStats } from '@/components/groups/leaderboard/leaderboard-stats';
import { AlertCircle, Trophy, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';

type Period = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

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

interface LeaderboardClientProps {
  groupId: string;
  groupSlug: string;
  initialPeriod: string;
}

export function LeaderboardClient({
  groupId,
  groupSlug,
  initialPeriod,
}: LeaderboardClientProps) {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<Period>(
    initialPeriod.toUpperCase() as Period
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, groupId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/groups/${groupId}/leaderboard/${period.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Liderlik tablosu yüklenemedi');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setUserPosition(data.userPosition || null);
    } catch (err) {
      console.error('Liderlik tablosu yükleme hatası:', err);
      setError('Liderlik tablosu yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    // URL'yi güncelle
    const url = new URL(window.location.href);
    url.searchParams.set('period', newPeriod.toLowerCase());
    window.history.pushState({}, '', url);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Liderlik tablosu yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Hata Oluştu</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="space-y-6">
        <LeaderboardFilters currentPeriod={period} onPeriodChange={handlePeriodChange} />
        
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Veri Yok</h3>
          <p className="text-gray-600">
            Liderlik tablosu için henüz yeterli aktivite bulunmuyor. Paylaşım yaparak,
            yorum bırakarak ve aktif olarak sıralamaya girebilirsiniz!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtreler */}
      <LeaderboardFilters currentPeriod={period} onPeriodChange={handlePeriodChange} />

      {/* İstatistikler */}
      <LeaderboardStats leaderboard={leaderboard} userPosition={userPosition} />

      {/* Liderlik Tablosu Başlığı */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sıralama</h2>
              <p className="text-sm text-gray-600">
                {period === 'WEEKLY' && 'Bu haftanın en aktif üyeleri'}
                {period === 'MONTHLY' && 'Bu ayın en aktif üyeleri'}
                {period === 'ALL_TIME' && 'Tüm zamanların en aktif üyeleri'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Kullanıcının Pozisyonu (Eğer ilk 10'da değilse) */}
      {userPosition && userPosition.rank && userPosition.rank > 10 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Sizin Pozisyonunuz
          </h3>
          <LeaderboardCard entry={userPosition} currentUserId={session?.user?.id} />
        </div>
      )}

      {/* Liderlik Tablosu Listesi */}
      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <LeaderboardCard
            key={entry.id}
            entry={entry}
            currentUserId={session?.user?.id}
          />
        ))}
      </div>

      {/* Bilgilendirme */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Puan Nasıl Hesaplanır?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Aktivite Skoru:</strong> Paylaşım (10p), Yorum (5p), Beğeni (2p),
            Mesaj (1p)
          </li>
          <li>
            • <strong>Kilo Kaybı Skoru:</strong> Kaybedilen kilo × 100
          </li>
          <li>
            • <strong>Streak Skoru:</strong> Ardışık aktif günler × 5
          </li>
          <li>
            • <strong>Toplam:</strong> (Aktivite × 0.3) + (Kilo Kaybı × 0.5) + (Streak ×
            0.2)
          </li>
        </ul>
      </div>
    </div>
  );
}
