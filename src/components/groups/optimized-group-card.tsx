'use client';

import Link from 'next/link';
import { Users, Trophy, TrendingDown, Dumbbell, Apple, Heart, Lock, ChevronRight, Eye } from 'lucide-react';
import { LazyImage } from '@/components/lazy-image';
import CategoryBadge from './category-badge';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  goalType: string;
  imageUrl?: string;
  isPrivate: boolean;
  level?: string;
  gender?: string;
  ageGroup?: string;
  _count: {
    members: number;
    challenges: number;
  };
}

interface OptimizedGroupCardProps {
  group: Group;
  onPreview: (slug: string) => void;
  priority?: boolean;
}

const goalTypeConfig = {
  'weight-loss': {
    label: 'Kilo Verme',
    icon: TrendingDown,
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  fitness: {
    label: 'Fitness',
    icon: Dumbbell,
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  'healthy-eating': {
    label: 'Sağlıklı Beslenme',
    icon: Apple,
    color: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  'muscle-gain': {
    label: 'Kas Kazanımı',
    icon: Heart,
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
};

export function OptimizedGroupCard({ group, onPreview, priority = false }: OptimizedGroupCardProps) {
  const config = goalTypeConfig[group.goalType as keyof typeof goalTypeConfig] || goalTypeConfig['weight-loss'];
  const Icon = config.icon;
  const prefersReducedMotion = useReducedMotion();

  const animationClass = prefersReducedMotion
    ? ''
    : 'hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2';

  return (
    <div
      className={`group bg-white rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 overflow-hidden cursor-pointer relative active:scale-95 ${animationClass}`}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('a')) {
          onPreview(group.slug);
        }
      }}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {group.imageUrl ? (
          <LazyImage
            src={group.imageUrl}
            alt={group.name}
            fill
            className={`object-cover ${prefersReducedMotion ? '' : 'group-hover:scale-110 transition-transform duration-500'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            quality={75}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
            <Icon className="w-16 sm:w-20 h-16 sm:h-20 text-white/30" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-start gap-2">
          <span
            className={`${config.bg} ${config.text} px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden xs:inline">{config.label}</span>
          </span>
          {group.isPrivate && (
            <span className="bg-gray-900/80 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
              <Lock className="w-3 h-3" />
              <span className="hidden xs:inline">Özel</span>
            </span>
          )}
        </div>

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent ${
            prefersReducedMotion ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'
          }`}
        />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3
          className={`text-lg sm:text-xl font-bold mb-2 text-gray-900 transition-colors line-clamp-1 ${
            prefersReducedMotion ? '' : 'group-hover:text-purple-600'
          }`}
        >
          {group.name}
        </h3>
        <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">{group.description}</p>

        {/* Category Badges */}
        {(group.level || group.gender || group.ageGroup) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {group.level && <CategoryBadge type="level" value={group.level} size="sm" />}
            {group.gender && <CategoryBadge type="gender" value={group.gender} size="sm" />}
            {group.ageGroup && <CategoryBadge type="ageGroup" value={group.ageGroup} size="sm" />}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="font-semibold">{group._count.members}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">{group._count.challenges}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(group.slug);
              }}
              className="p-2 hover:bg-purple-50 active:bg-purple-100 rounded-full transition-colors touch-manipulation"
              title="Önizleme"
              aria-label="Grup önizlemesi"
            >
              <Eye className="w-4 h-4 text-purple-600" />
            </button>
            <Link
              href={`/groups/${group.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 active:text-purple-800 font-semibold text-sm touch-manipulation"
            >
              <span className="hidden xs:inline">Detay</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
