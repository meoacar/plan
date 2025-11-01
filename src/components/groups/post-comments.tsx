'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
}

interface PostCommentsProps {
  postId: string;
  groupSlug: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
}

export default function PostComments({
  postId,
  groupSlug,
  currentUserId,
  onCommentAdded,
}: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Yorumları yükle
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupSlug}/posts/${postId}/comments`);

      if (!res.ok) {
        throw new Error('Yorumlar yüklenemedi');
      }

      const data = await res.json();
      setComments(data.comments);
    } catch (err) {
      console.error('Yorum yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('Yorum boş olamaz');
      return;
    }

    if (!currentUserId) {
      setError('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await fetch(`/api/groups/${groupSlug}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Yorum eklenemedi');
      }

      const comment = await res.json();
      setComments([...comments, comment]);
      setNewComment('');

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Yorum Listesi */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.user.username || comment.user.id}`}>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 bg-white rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile/${comment.user.username || comment.user.id}`}
                    className="font-semibold text-sm text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    {comment.user.name}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          Henüz yorum yok. İlk yorumu siz yapın!
        </div>
      )}

      {/* Yorum Ekleme Formu */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorum yazın..."
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              maxLength={1000}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </form>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          Yorum yapmak için{' '}
          <Link href="/login" className="text-purple-600 hover:underline font-semibold">
            giriş yapın
          </Link>
        </div>
      )}
    </div>
  );
}
