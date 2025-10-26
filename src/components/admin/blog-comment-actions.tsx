'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type BlogCommentActionsProps = {
  commentId: string;
  isApproved: boolean;
};

export function BlogCommentActions({
  commentId,
  isApproved,
}: BlogCommentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Hata oluştu');
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}/reject`, {
        method: 'POST',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Hata oluştu');
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Hata oluştu');
      }
    } catch (error) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {!isApproved && (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          Onayla
        </button>
      )}
      {isApproved && (
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition"
        >
          Onayı Kaldır
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
      >
        Sil
      </button>
    </div>
  );
}
