'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Confession {
  id: string;
  text: string;
  aiReply: string | null;
  isAnonymous: boolean;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
    reactions: number;
  };
  reactions: Array<{
    emoji: string;
    userId: string;
  }>;
}

const EMOJIS = ['😂', '🫶', '💪', '😅', '🤗', '👏', '❤️', '🔥'];

export default function ConfessionWallPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchConfessions();
  }, [sort]);

  const fetchConfessions = async () => {
    try {
      const res = await fetch(`/api/confessions?sort=${sort}&limit=20`);
      const data = await res.json();
      setConfessions(data.confessions || []);
    } catch (error) {
      console.error('İtiraflar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim() || text.length < 10) {
      alert('İtiraf en az 10 karakter olmalı');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, isAnonymous: true }),
      });

      if (!res.ok) throw new Error();

      const newConfession = await res.json();
      setConfessions([newConfession, ...confessions]);
      setText('');
      alert('İtirafın paylaşıldı! +50 XP kazandın 🎉');
    } catch (error) {
      alert('İtiraf gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const res = await fetch(`/api/confessions/${id}/like`, {
        method: 'POST',
      });
      const data = await res.json();
      
      setConfessions(confessions.map(c => {
        if (c.id === id) {
          return {
            ...c,
            _count: {
              ...c._count,
              likes: data.liked ? c._count.likes + 1 : c._count.likes - 1,
            },
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('İşlem başarısız:', error);
    }
  };

  const handleReact = async (id: string, emoji: string) => {
    try {
      const res = await fetch(`/api/confessions/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      
      if (res.ok) {
        fetchConfessions();
      }
    } catch (error) {
      console.error('İşlem başarısız:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🍰 Yeme Günahı İtiraf Duvarı
          </h1>
          <p className="text-gray-600">
            Anonim olarak paylaş, AI\'dan esprili yanıt al, toplulukla bağ kur!
          </p>
        </div>

        {/* Confession Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Yeme günahını itiraf et... (örn: Gece 2'de dolmayı gömdüm, pişman değilim)"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
              rows={4}
              maxLength={500}
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {text.length}/500 karakter
              </span>
              <button
                type="submit"
                disabled={submitting || text.length < 10}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Gönderiliyor...' : 'İtiraf Et (+50 XP)'}
              </button>
            </div>
          </form>
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSort('recent')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              sort === 'recent'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🕐 En Yeniler
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              sort === 'popular'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔥 Popüler
          </button>
        </div>

        {/* Confessions List */}
        <div className="space-y-6">
          {confessions.map((confession) => (
            <div
              key={confession.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              {/* Confession Text */}
              <div className="mb-4">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {confession.text}
                </p>
              </div>

              {/* AI Reply */}
              {confession.aiReply && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p className="text-sm font-semibold text-purple-900 mb-1">
                        AI Yanıtı:
                      </p>
                      <p className="text-gray-700 italic">
                        &quot;{confession.aiReply}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 text-sm">
                <button
                  onClick={() => handleLike(confession.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <span className="text-xl">❤️</span>
                  <span>{confession._count.likes}</span>
                </button>

                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">💬</span>
                  <span>{confession._count.comments}</span>
                </div>

                {/* Emoji Reactions */}
                <div className="flex gap-2 ml-auto">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(confession.id, emoji)}
                      className="text-xl hover:scale-125 transition-transform"
                      title={`${emoji} ile tepki ver`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reaction Summary */}
              {confession.reactions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(
                      confession.reactions.reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-3 text-xs text-gray-400">
                {new Date(confession.createdAt).toLocaleString('tr-TR')}
              </div>
            </div>
          ))}
        </div>

        {confessions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Henüz itiraf yok. İlk sen paylaş! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
