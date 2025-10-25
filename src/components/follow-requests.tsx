'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, UserPlus, Check, X, Clock } from 'lucide-react';

interface FollowRequest {
  id: string;
  follower: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    bio: string | null;
  };
  createdAt: string;
}

export default function FollowRequests() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/follow/request');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching follow requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (followId: string, action: 'accept' | 'reject') => {
    setProcessingIds((prev) => new Set(prev).add(followId));

    try {
      const res = await fetch('/api/follow/request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      // İsteği listeden kaldır
      setRequests((prev) => prev.filter((req) => req.id !== followId));
    } catch (error: any) {
      console.error('Error handling request:', error);
      alert(error.message || 'Bir hata oluştu');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(followId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Bekleyen İstek Yok
        </h3>
        <p className="text-gray-500">
          Şu anda bekleyen takip isteğiniz bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <UserPlus className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Takip İstekleri</h2>
            <p className="text-purple-100">
              {requests.length} bekleyen istek
            </p>
          </div>
        </div>
      </div>

      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            <Link href={`/profile/${request.follower.id}`}>
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                {request.follower.image ? (
                  <Image
                    src={request.follower.image}
                    alt={request.follower.name || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {request.follower.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${request.follower.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition-colors block truncate"
                  >
                    {request.follower.name || 'İsimsiz Kullanıcı'}
                  </Link>
                  {request.follower.username && (
                    <p className="text-gray-500 text-sm">@{request.follower.username}</p>
                  )}
                  {request.follower.bio && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {request.follower.bio}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(request.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(request.id, 'accept')}
                    disabled={processingIds.has(request.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.has(request.id) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span className="hidden sm:inline">Kabul Et</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRequest(request.id, 'reject')}
                    disabled={processingIds.has(request.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.has(request.id) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        <span className="hidden sm:inline">Reddet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
