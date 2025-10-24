'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  challengeId: string;
}

export default function Leaderboard({ challengeId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [challengeId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/challenges/${challengeId}/leaderboard`);
      const data = await res.json();
      setEntries(data || []);
    } catch (error) {
      console.error('Sıralama yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
        <h2 className="text-2xl font-bold text-white">🏆 Lider Tablosu</h2>
      </div>

      <div className="divide-y">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`p-4 flex items-center gap-4 ${
              index < 3 ? 'bg-yellow-50' : ''
            }`}
          >
            <div className="text-2xl font-bold w-12 text-center">
              {entry.rank === 1 && '🥇'}
              {entry.rank === 2 && '🥈'}
              {entry.rank === 3 && '🥉'}
              {entry.rank > 3 && entry.rank}
            </div>
            
            <div className="flex-1">
              <div className="font-medium">Kullanıcı #{entry.userId.slice(0, 8)}</div>
            </div>

            <div className="text-xl font-bold text-blue-600">
              {entry.score.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Henüz sıralama bulunmuyor
        </div>
      )}
    </div>
  );
}
