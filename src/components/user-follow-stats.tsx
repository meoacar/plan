'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';

interface UserFollowStatsProps {
  userId: string;
  initialFollowersCount?: number;
  initialFollowingCount?: number;
}

export default function UserFollowStats({
  userId,
  initialFollowersCount = 0,
  initialFollowingCount = 0,
}: UserFollowStatsProps) {
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetch(`/api/follow/followers?userId=${userId}&limit=1`),
          fetch(`/api/follow/following?userId=${userId}&limit=1`),
        ]);

        const [followersData, followingData] = await Promise.all([
          followersRes.json(),
          followingRes.json(),
        ]);

        setFollowersCount(followersData.total || 0);
        setFollowingCount(followingData.total || 0);
      } catch (error) {
        console.error('Error fetching follow counts:', error);
      }
    };

    fetchCounts();
  }, [userId]);

  return (
    <div className="flex items-center gap-6 text-sm">
      <Link
        href={`/profile/${userId}/followers`}
        className="flex items-center gap-2 hover:text-purple-600 transition-colors"
      >
        <Users className="w-4 h-4" />
        <span>
          <strong className="font-semibold">{followersCount}</strong> Takipçi
        </span>
      </Link>
      <Link
        href={`/profile/${userId}/following`}
        className="flex items-center gap-2 hover:text-purple-600 transition-colors"
      >
        <Users className="w-4 h-4" />
        <span>
          <strong className="font-semibold">{followingCount}</strong> Takip
        </span>
      </Link>
    </div>
  );
}
