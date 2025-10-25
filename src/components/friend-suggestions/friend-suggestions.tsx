'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, MapPin, Target, FileText, TrendingUp, Sparkles, UserPlus, Eye } from 'lucide-react';

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
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/friend-suggestions');
      const data = await res.json();
      console.log('Friend suggestions data:', data);
      setSuggestions(data || []);
    } catch (error) {
      console.error('Öneriler yüklenemedi', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      setFollowingIds(prev => new Set(prev).add(userId));

      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });

      const data = await res.json();

      if (res.ok) {
        // Başarılı takip sonrası öneriyi listeden kaldır
        setTimeout(() => {
          setSuggestions(suggestions.filter((s) => s.id !== userId));
        }, 1000);
      } else {
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        const errorMessage = data.message || 'Takip edilemedi';
        alert(errorMessage);
      }
    } catch (error) {
      setFollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      alert('Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d7a4a] mb-4"></div>
          <p className="text-gray-600">Öneriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz Öneri Yok</h3>
          <p className="text-gray-600">
            Profilinizi tamamlayın ve hedeflerinizi belirleyin, size benzer kullanıcıları önerelim!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Sizin İçin Özel Seçildi</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Arkadaş Önerileri
        </h2>
        <p className="text-gray-600">
          Benzer hedeflere sahip kullanıcılarla tanışın ve birlikte başarıya ulaşın
        </p>
      </div>

      {/* Suggestions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => {
          const isFollowing = followingIds.has(suggestion.id);

          return (
            <div
              key={suggestion.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Card Header with Score Badge */}
              <div className="relative h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold text-purple-600">{suggestion.score}%</span>
                  </div>
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  {suggestion.image && suggestion.image.trim() !== '' ? (
                    <div className="relative w-24 h-24">
                      <img
                        src={suggestion.image}
                        alt={suggestion.name || 'Kullanıcı'}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          // Resim yüklenemezse default avatar göster
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-white shadow-lg">
                                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-white shadow-lg">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-16 px-6 pb-6">
                {/* Name & Username */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {suggestion.name}
                  </h3>
                  {suggestion.username && (
                    <p className="text-sm text-gray-500">@{suggestion.username}</p>
                  )}
                </div>

                {/* Reason Badge */}
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-purple-700 font-medium text-center flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {suggestion.reason}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {suggestion.goalWeight && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 mb-1">Hedef</p>
                      <p className="text-sm font-bold text-gray-800">{suggestion.goalWeight} kg</p>
                    </div>
                  )}
                  {suggestion.city && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <MapPin className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 mb-1">Şehir</p>
                      <p className="text-sm font-bold text-gray-800">{suggestion.city}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500 mb-1">Takipçi</p>
                    <p className="text-sm font-bold text-gray-800">{suggestion._count.followers}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <FileText className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500 mb-1">Plan</p>
                    <p className="text-sm font-bold text-gray-800">{suggestion._count.plans}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/profile/${suggestion.username || suggestion.id}`}
                    className="flex-1 py-2.5 px-4 text-center border-2 border-gray-200 text-gray-700 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all font-medium flex items-center justify-center gap-2 group"
                  >
                    <Eye className="w-4 h-4 group-hover:text-purple-600 transition-colors" />
                    <span className="group-hover:text-purple-600 transition-colors">Profil</span>
                  </Link>
                  <button
                    onClick={() => handleFollow(suggestion.id)}
                    disabled={isFollowing}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isFollowing
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-wait'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:scale-105'
                      }`}
                  >
                    {isFollowing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Takip Et</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

<style jsx>{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
