'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Users } from 'lucide-react';
import FollowButton from './follow-button';

interface User {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  xp: number;
  level: number;
  _count: {
    plans: number;
    followers: number;
    following: number;
  };
}

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
}

export default function FollowList({ userId, type }: FollowListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const endpoint = type === 'followers' ? 'followers' : 'following';
        const res = await fetch(`/api/follow/${endpoint}?userId=${userId}&page=${page}`);
        const data = await res.json();

        setUsers(data[type] || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, page]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">
          {type === 'followers' ? 'Henüz takipçi yok' : 'Henüz kimseyi takip etmiyor'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            <Link href={`/profile/${user.id}`}>
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${user.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition-colors block truncate"
                  >
                    {user.name || 'İsimsiz Kullanıcı'}
                  </Link>
                  {user.bio && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{user.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Level {user.level}</span>
                    <span>•</span>
                    <span>{user._count.plans} Plan</span>
                    <span>•</span>
                    <span>{user._count.followers} Takipçi</span>
                  </div>
                </div>

                <FollowButton userId={user.id} variant="compact" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Önceki
          </button>
          <span className="px-4 py-2 bg-white rounded-lg shadow-md">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
