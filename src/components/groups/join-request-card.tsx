'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

interface JoinRequestCardProps {
  request: {
    id: string;
    message: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      username: string | null;
      bio: string | null;
      startWeight: number | null;
      goalWeight: number | null;
      level: number;
      streak: number;
    } | null;
  };
  groupSlug: string;
}

export function JoinRequestCard({ request, groupSlug }: JoinRequestCardProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  if (isProcessed || !request.user) {
    return null;
  }

  const profileUrl = request.user.username
    ? `/profile/${request.user.username}`
    : `/profile/${request.user.id}`;

  const weightLoss =
    request.user.startWeight && request.user.goalWeight
      ? request.user.startWeight - request.user.goalWeight
      : null;

  const handleApprove = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/groups/${groupSlug}/join-requests/${request.id}/approve`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İstek onaylanamadı');
      }

      addToast({
        type: 'success',
        title: 'Katılma isteği onaylandı',
      });
      setIsProcessed(true);
      router.refresh();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: error.message || 'Bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (isLoading) return;

    const confirmed = confirm('Bu katılma isteğini reddetmek istediğinizden emin misiniz?');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/groups/${groupSlug}/join-requests/${request.id}/reject`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İstek reddedilemedi');
      }

      addToast({
        type: 'success',
        title: 'Katılma isteği reddedildi',
      });
      setIsProcessed(true);
      router.refresh();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: error.message || 'Bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={profileUrl} className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {request.user.image ? (
              <Image
                src={request.user.image}
                alt={request.user.name || 'Kullanıcı'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                👤
              </div>
            )}
          </div>
        </Link>

        {/* Bilgiler */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                href={profileUrl}
                className="font-semibold text-gray-900 hover:text-green-600 transition-colors block truncate"
              >
                {request.user.name || 'İsimsiz Kullanıcı'}
              </Link>
              {request.user.username && (
                <p className="text-sm text-gray-500 truncate">
                  @{request.user.username}
                </p>
              )}

              {/* Bio */}
              {request.user.bio && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {request.user.bio}
                </p>
              )}

              {/* İstatistikler */}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>Seviye {request.user.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔥</span>
                  <span>{request.user.streak} gün</span>
                </div>
                {weightLoss && weightLoss > 0 && (
                  <div className="flex items-center gap-1">
                    <span>📉</span>
                    <span>{weightLoss} kg hedef</span>
                  </div>
                )}
              </div>

              {/* Mesaj */}
              {request.message && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    &quot;{request.message}&quot;
                  </p>
                </div>
              )}

              {/* Tarih */}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(request.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
              >
                ✓ Onayla
              </button>
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
              >
                ✗ Reddet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
