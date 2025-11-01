'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Lock, ChevronRight, X, TrendingDown, Dumbbell, Apple, Heart } from 'lucide-react';
import MatchScore from './match-score';

interface RecommendedGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isPrivate: boolean;
  memberCount: number;
  matchScore: {
    total: number;
    goal: number;
    friends: number;
    activity: number;
    location: number;
  };
  reason: string;
}

interface Props {
  group: RecommendedGroup;
}

const goalTypeIcons = {
  'weight-loss': TrendingDown,
  'fitness': Dumbbell,
  'healthy-eating': Apple,
  'muscle-gain': Heart,
};

export default function RecommendationCard({ group }: Props) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDismissing) return;

    try {
      setIsDismissing(true);
      
      const res = await fetch('/api/groups/recommendations/dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId: group.id }),
      });

      if (res.ok) {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('Öneri kapatılamadı:', error);
    } finally {
      setIsDismissing(false);
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Link
      href={`/groups/${group.slug}`}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        disabled={isDismissing}
        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50"
        title="Bu öneriyi kapat"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {group.imageUrl ? (
          <Image
            src={group.imageUrl}
            alt={group.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Users className="w-20 h-20 text-white/30" />
          </div>
        )}

        {/* Match Score Badge */}
        <div className="absolute top-3 left-3">
          <MatchScore score={group.matchScore.total} />
        </div>

        {/* Private Badge */}
        {group.isPrivate && (
          <div className="absolute top-3 right-14">
            <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
              <Lock className="w-3 h-3" />
              Özel
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
          {group.name}
        </h3>
        
        <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
          {group.description}
        </p>

        {/* Recommendation Reason */}
        <div className="mb-4 p-3 bg-purple-50 rounded-xl">
          <p className="text-purple-700 text-xs font-semibold">
            {group.reason}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="font-semibold">{group.memberCount} üye</span>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
