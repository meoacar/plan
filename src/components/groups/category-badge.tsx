'use client';

import { Layers, Users, Calendar } from 'lucide-react';

interface CategoryBadgeProps {
  type: 'level' | 'gender' | 'ageGroup';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

const categoryLabels: Record<string, Record<string, string>> = {
  level: {
    BEGINNER: 'Başlangıç',
    INTERMEDIATE: 'Orta',
    ADVANCED: 'İleri'
  },
  gender: {
    MALE: 'Erkek',
    FEMALE: 'Kadın',
    MIXED: 'Karma'
  },
  ageGroup: {
    AGE_18_25: '18-25',
    AGE_26_35: '26-35',
    AGE_36_45: '36-45',
    AGE_46_PLUS: '46+'
  }
};

const categoryColors: Record<string, Record<string, string>> = {
  level: {
    BEGINNER: 'bg-green-100 text-green-700 border-green-200',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ADVANCED: 'bg-red-100 text-red-700 border-red-200'
  },
  gender: {
    MALE: 'bg-blue-100 text-blue-700 border-blue-200',
    FEMALE: 'bg-pink-100 text-pink-700 border-pink-200',
    MIXED: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  ageGroup: {
    AGE_18_25: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    AGE_26_35: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    AGE_36_45: 'bg-violet-100 text-violet-700 border-violet-200',
    AGE_46_PLUS: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200'
  }
};

const categoryIcons = {
  level: Layers,
  gender: Users,
  ageGroup: Calendar
};

export default function CategoryBadge({ type, value, size = 'md' }: CategoryBadgeProps) {
  const label = categoryLabels[type]?.[value] || value;
  const colorClass = categoryColors[type]?.[value] || 'bg-gray-100 text-gray-700 border-gray-200';
  const Icon = categoryIcons[type];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colorClass} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  );
}
