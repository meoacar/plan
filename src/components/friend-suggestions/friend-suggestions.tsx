'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Suggestion {
  id: string;
  name: string;
  username?: string;
  image?: string;
  goalWeight?: number;
  city?: string;
  score: number;
  reason: string;
  _count: {
    followers: number;
    plans: number;
  };
}

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/friend-suggestions');
      const data = await res.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error('Öneriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });

      if (res.ok) {
        alert('Takip edildi!');
        setSuggestions(suggestions.filter((s) => s.id !== userId));
      } else {
        alert('Takip edilemedi');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Şu anda öneri bulunmuyor
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Arkadaş Önerileri</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              {suggestion.image ? (
                <img
                  src={suggestion.image}
                  alt={suggestion.name || 'Kullanıcı'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-bold">{suggestion.name}</h3>
                {suggestion.username && (
                  <p className="text-sm text-gray-500">@{suggestion.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {suggestion.goalWeight && (
                <div>🎯 Hedef: {suggestion.goalWeight} kg</div>
              )}
              {suggestion.city && <div>📍 {suggestion.city}</div>}
              <div>👥 {suggestion._count.followers} takipçi</div>
              <div>📝 {suggestion._count.plans} plan</div>
              <div className="text-xs text-blue-600 mt-2">{suggestion.reason}</div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/profile/${suggestion.username || suggestion.id}`}
                className="flex-1 py-2 text-center border border-gray-300 rounded hover:bg-gray-50"
              >
                Profil
              </Link>
              <button
                onClick={() => handleFollow(suggestion.id)}
                className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Takip Et
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
