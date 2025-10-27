'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Confession {
  id: string;
  text: string;
  aiReply: string | null;
  isAnonymous: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    likes: number;
    comments: number;
    reactions: number;
  };
}

export default function AdminConfessionsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [sessionStatus, session, router]);

  useEffect(() => {
    fetchConfessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const fetchConfessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/confessions?status=${status}&page=${page}&limit=20`);
      const data = await res.json();
      setConfessions(data.confessions || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('İtiraflar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Bu itirafı onaylamak istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (res.ok) {
        alert('İtiraf onaylandı!');
        fetchConfessions();
      } else {
        alert('İşlem başarısız');
      }
    } catch {
      alert('Bir hata oluştu');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Red nedeni (opsiyonel):');
    if (reason === null) return;

    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'REJECTED',
          rejectionReason: reason || 'Uygunsuz içerik'
        }),
      });

      if (res.ok) {
        alert('İtiraf reddedildi!');
        fetchConfessions();
      } else {
        alert('İşlem başarısız');
      }
    } catch {
      alert('Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu itirafı kalıcı olarak silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('İtiraf silindi!');
        fetchConfessions();
      } else {
        alert('İşlem başarısız');
      }
    } catch {
      alert('Bir hata oluştu');
    }
  };

  const handleEdit = (confession: Confession) => {
    setEditingId(confession.id);
    setEditText(confession.text);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText }),
      });

      if (res.ok) {
        alert('İtiraf güncellendi!');
        setEditingId(null);
        fetchConfessions();
      } else {
        alert('İşlem başarısız');
      }
    } catch {
      alert('Bir hata oluştu');
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          İtiraf Moderasyonu
        </h1>
        <p className="text-gray-600">
          Kullanıcı itiraflarını onaylayın, düzenleyin veya silin
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s as any);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              status === s
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === 'PENDING' && '⏳ Bekleyen'}
            {s === 'APPROVED' && '✅ Onaylanan'}
            {s === 'REJECTED' && '❌ Reddedilen'}
            {s === 'ALL' && '📋 Tümü'}
          </button>
        ))}
      </div>

      {/* Confessions List */}
      <div className="space-y-4">
        {confessions.map((confession) => (
          <div
            key={confession.id}
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              confession.status === 'PENDING'
                ? 'border-yellow-500'
                : confession.status === 'APPROVED'
                ? 'border-green-500'
                : 'border-red-500'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    confession.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : confession.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {confession.status === 'PENDING' && '⏳ Bekliyor'}
                  {confession.status === 'APPROVED' && '✅ Onaylandı'}
                  {confession.status === 'REJECTED' && '❌ Reddedildi'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(confession.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>❤️ {confession._count.likes}</span>
                <span>💬 {confession._count.comments}</span>
                <span>😊 {confession._count.reactions}</span>
              </div>
            </div>

            {/* Content */}
            {editingId === confession.id ? (
              <div className="mb-4">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSaveEdit(confession.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {confession.text}
                </p>
              </div>
            )}

            {/* AI Reply */}
            {confession.aiReply && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-purple-900 mb-1">
                  🤖 AI Yanıtı:
                </p>
                <p className="text-gray-700 italic">
                  &quot;{confession.aiReply}&quot;
                </p>
              </div>
            )}

            {/* Rejection Reason */}
            {confession.status === 'REJECTED' && confession.rejectionReason && (
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  ❌ Red Nedeni:
                </p>
                <p className="text-gray-700">{confession.rejectionReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {confession.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApprove(confession.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Onayla
                  </button>
                  <button
                    onClick={() => handleReject(confession.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ❌ Reddet
                  </button>
                </>
              )}
              {confession.status === 'APPROVED' && (
                <button
                  onClick={() => handleReject(confession.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  ❌ Reddet
                </button>
              )}
              {confession.status === 'REJECTED' && (
                <button
                  onClick={() => handleApprove(confession.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✅ Onayla
                </button>
              )}
              <button
                onClick={() => handleEdit(confession)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✏️ Düzenle
              </button>
              <button
                onClick={() => handleDelete(confession.id)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {confessions.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">
            Bu kategoride itiraf bulunamadı.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Önceki
          </button>
          <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}
