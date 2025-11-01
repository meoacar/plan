'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface PostLikeButtonProps {
  postId: string;
  groupSlug: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
  onLikeUpdate: (isLiked: boolean, likeCount: number) => void;
  disabled?: boolean;
}

export default function PostLikeButton({
  postId,
  groupSlug,
  initialIsLiked,
  initialLikeCount,
  onLikeUpdate,
  disabled,
}: PostLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (disabled || loading) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
    onLikeUpdate(newIsLiked, newLikeCount);

    try {
      setLoading(true);

      const res = await fetch(`/api/groups/${groupSlug}/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!res.ok) {
        // Revert on error
        setIsLiked(!newIsLiked);
        setLikeCount(newIsLiked ? newLikeCount - 1 : newLikeCount + 1);
        onLikeUpdate(!newIsLiked, newIsLiked ? newLikeCount - 1 : newLikeCount + 1);

        const data = await res.json();
        throw new Error(data.error || 'Beğeni işlemi başarısız');
      }

      const data = await res.json();
      // Update with server response
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
      onLikeUpdate(data.isLiked, data.likeCount);
    } catch (error) {
      console.error('Beğeni hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={disabled || loading}
      className={`flex items-center gap-2 transition-all group ${disabled
        ? 'text-gray-400 cursor-not-allowed'
        : isLiked
          ? 'text-red-600'
          : 'text-gray-600 hover:text-red-600'
        }`}
      title={disabled ? 'Beğenmek için giriş yapın' : isLiked ? 'Beğeniyi kaldır' : 'Beğen'}
    >
      <Heart
        className={`w-5 h-5 transition-all ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
          }`}
      />
      <span className="font-semibold">{likeCount}</span>
    </button>
  );
}
