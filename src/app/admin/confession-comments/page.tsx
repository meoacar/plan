'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Comment {
    id: string;
    content: string;
    isAnonymous: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    confession: {
        id: string;
        text: string;
    };
}

export default function AdminConfessionCommentsPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role !== 'ADMIN') {
            router.push('/');
        }
    }, [sessionStatus, session, router]);

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, page]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/confession-comments?status=${status}&page=${page}&limit=20`);
            const data = await res.json();
            setComments(data.comments || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Yorumlar yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Bu yorumu onaylamak istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/confession-comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });

            if (res.ok) {
                alert('Yorum onaylandı!');
                fetchComments();
            } else {
                alert('İşlem başarısız');
            }
        } catch {
            alert('Bir hata oluştu');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Bu yorumu reddetmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/confession-comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' }),
            });

            if (res.ok) {
                alert('Yorum reddedildi!');
                fetchComments();
            } else {
                alert('İşlem başarısız');
            }
        } catch {
            alert('Bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/confession-comments/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Yorum silindi!');
                fetchComments();
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
                    İtiraf Yorumları Moderasyonu
                </h1>
                <p className="text-gray-600">
                    Kullanıcı yorumlarını onaylayın veya silin
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
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${status === s
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

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className={`bg-white rounded-lg shadow p-6 border-l-4 ${comment.status === 'PENDING'
                            ? 'border-yellow-500'
                            : comment.status === 'APPROVED'
                                ? 'border-green-500'
                                : 'border-red-500'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${comment.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : comment.status === 'APPROVED'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {comment.status === 'PENDING' && '⏳ Bekliyor'}
                                    {comment.status === 'APPROVED' && '✅ Onaylandı'}
                                    {comment.status === 'REJECTED' && '❌ Reddedildi'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(comment.createdAt).toLocaleString('tr-TR')}
                                </span>
                            </div>
                        </div>

                        {/* Original Confession */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                📝 İtiraf:
                            </p>
                            <p className="text-gray-600 text-sm line-clamp-2">
                                {comment.confession.text}
                            </p>
                        </div>

                        {/* Comment Content */}
                        <div className="mb-4">
                            <p className="text-gray-800 text-lg leading-relaxed">
                                💬 {comment.content}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                            {comment.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => handleApprove(comment.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        ✅ Onayla
                                    </button>
                                    <button
                                        onClick={() => handleReject(comment.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        ❌ Reddet
                                    </button>
                                </>
                            )}
                            {comment.status === 'APPROVED' && (
                                <button
                                    onClick={() => handleReject(comment.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    ❌ Reddet
                                </button>
                            )}
                            {comment.status === 'REJECTED' && (
                                <button
                                    onClick={() => handleApprove(comment.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    ✅ Onayla
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                🗑️ Sil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {comments.length === 0 && !loading && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">
                        Bu kategoride yorum bulunamadı.
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
