'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
      
      // Rozet kazanıldı mı kontrol et
      if (newConfession.newBadges && newConfession.newBadges.length > 0) {
        const badgeNames = newConfession.newBadges.map((b: any) => `${b.icon} ${b.name}`).join(', ');
        alert(`İtirafın gönderildi! Admin onayından sonra yayınlanacak. +50 XP kazandın 🎉\n\nYeni Rozet: ${badgeNames}`);
      } else {
        alert('İtirafın gönderildi! Admin onayından sonra yayınlanacak. +50 XP kazandın 🎉');
      }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-6xl"
        >
          🍰
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 text-6xl opacity-20"
        >
          🍕
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-20 text-7xl opacity-20"
        >
          🍰
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-1/4 text-5xl opacity-20"
        >
          🍔
        </motion.div>
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-40 right-1/3 text-6xl opacity-20"
        >
          🍩
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-7xl mb-4"
          >
            🍰
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
            Yeme Günahı İtiraf Duvarı
          </h1>
          <p className="text-pink-100 text-lg md:text-xl font-medium">
            Anonim paylaş, AI yanıtı al, toplulukla bağ kur! ✨
          </p>
        </motion.div>

        {/* Confession Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Yeme günahını itiraf et... (örn: Gece 2'de dolmayı gömdüm, pişman değilim) 😋"
                className="w-full p-5 bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-400/20 focus:outline-none resize-none text-gray-800 placeholder-gray-500 text-lg transition-all"
                rows={4}
                maxLength={500}
                disabled={submitting}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: text.length > 0 ? 1 : 0 }}
                className="absolute top-4 right-4 text-2xl"
              >
                ✍️
              </motion.div>
            </div>
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-sm font-medium">
                  {text.length}/500
                </span>
                <motion.div
                  animate={{
                    width: `${(text.length / 500) * 100}px`,
                  }}
                  className="h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={submitting || text.length < 10}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.span>
                    Gönderiliyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🚀 İtiraf Et (+50 XP)
                  </span>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Sort Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSort('recent')}
            className={`flex-1 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
              sort === 'recent'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl'
                : 'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }`}
          >
            🕐 En Yeniler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSort('popular')}
            className={`flex-1 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
              sort === 'popular'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl'
                : 'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }`}
          >
            🔥 Popüler
          </motion.button>
        </motion.div>

        {/* Confessions List */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-6">
            {confessions.map((confession, index) => (
              <motion.div
                key={confession.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 hover:shadow-pink-500/20 transition-all group"
              >
                {/* Confession Text */}
                <div className="mb-6">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white text-xl leading-relaxed font-medium"
                  >
                    {confession.text}
                  </motion.p>
                </div>

                {/* AI Reply */}
                {confession.aiReply && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-300/30 rounded-2xl p-5 mb-6"
                  >
                    <div className="flex items-start gap-4">
                      <motion.span
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-3xl"
                      >
                        🤖
                      </motion.span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-purple-200 mb-2">
                          AI Yanıtı:
                        </p>
                        <p className="text-white/90 italic text-lg">
                          &quot;{confession.aiReply}&quot;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 text-sm flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(confession.id)}
                    className="flex items-center gap-2 text-white/80 hover:text-red-400 transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl"
                  >
                    <span className="text-2xl">❤️</span>
                    <span className="font-bold">{confession._count.likes}</span>
                  </motion.button>

                  <div className="flex items-center gap-2 text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="text-2xl">💬</span>
                    <span className="font-bold">{confession._count.comments}</span>
                  </div>

                  {/* Emoji Reactions */}
                  <div className="flex gap-2 ml-auto flex-wrap">
                    {EMOJIS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.3, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReact(confession.id, emoji)}
                        className="text-2xl hover:drop-shadow-lg transition-all bg-white/10 backdrop-blur-sm w-12 h-12 rounded-xl flex items-center justify-center"
                        title={`${emoji} ile tepki ver`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Reaction Summary */}
                {confession.reactions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-white/20"
                  >
                    <div className="flex gap-3 flex-wrap">
                      {Object.entries(
                        confession.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([emoji, count]) => (
                        <motion.span
                          key={emoji}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2"
                        >
                          <span className="text-xl">{emoji}</span>
                          <span>{count}</span>
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Timestamp */}
                <div className="mt-4 text-xs text-white/50 font-medium">
                  📅 {new Date(confession.createdAt).toLocaleString('tr-TR')}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {confessions.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            <p className="text-white text-2xl font-bold">
              Henüz itiraf yok. İlk sen paylaş!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
