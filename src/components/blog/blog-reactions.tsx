'use client';

import { useState, useEffect } from 'react';

type Reaction = {
  emoji: string;
  count: number;
  hasReacted: boolean;
};

const REACTIONS = [
  { emoji: '👍', label: 'Beğendim' },
  { emoji: '❤️', label: 'Harika' },
  { emoji: '🔥', label: 'Süper' },
  { emoji: '💪', label: 'Motive Oldum' },
  { emoji: '🎯', label: 'Faydalı' },
  { emoji: '🤔', label: 'Düşündürücü' },
];

type BlogReactionsProps = {
  postId: string;
  userId?: string;
};

export function BlogReactions({ postId, userId }: BlogReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReactions();
  }, [postId, userId]);

  const fetchReactions = async () => {
    try {
      const res = await fetch(`/api/blog/${postId}/reactions${userId ? `?userId=${userId}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setReactions(data);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/blog/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        fetchReactions();
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-16 h-12 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Bu yazıyı nasıl buldunuz?</h3>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ emoji, label }) => {
          const reaction = reactions.find((r) => r.emoji === emoji);
          const count = reaction?.count || 0;
          const hasReacted = reaction?.hasReacted || false;

          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={!userId}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all ${
                hasReacted
                  ? 'bg-green-100 border-2 border-green-500 text-green-700 scale-105'
                  : 'bg-gray-100 border-2 border-transparent hover:border-gray-300 text-gray-700 hover:scale-105'
              } ${!userId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              title={userId ? label : 'Giriş yapın'}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{emoji}</span>
                {count > 0 && (
                  <span className={`text-sm font-bold ${hasReacted ? 'text-green-700' : 'text-gray-600'}`}>
                    {count}
                  </span>
                )}
              </span>
              
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>
      
      {!userId && (
        <p className="text-xs text-gray-500 mt-3">
          Tepki vermek için <a href="/login" className="text-green-600 hover:underline font-medium">giriş yapın</a>
        </p>
      )}
    </div>
  );
}
