'use client';

import { X } from 'lucide-react';

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: { [key: string]: string };
  onRemoveFilter: (key: string) => void;
}

const filterLabels: Record<string, string> = {
  goalType: 'Hedef',
  activityLevel: 'Aktivite',
  level: 'Seviye',
  minMembers: 'Min. Üye',
  maxMembers: 'Maks. Üye',
  city: 'Şehir',
  category: 'Kategori',
  sortBy: 'Sıralama',
};

const filterValueLabels: Record<string, Record<string, string>> = {
  goalType: {
    'weight-loss': 'Kilo Verme',
    'fitness': 'Fitness',
    'healthy-eating': 'Sağlıklı Beslenme',
    'muscle-gain': 'Kas Kazanımı',
  },
  activityLevel: {
    'high': 'Yüksek',
    'medium': 'Orta',
    'low': 'Düşük',
  },
  level: {
    'beginner': 'Başlangıç',
    'advanced': 'İleri',
  },
  sortBy: {
    'createdAt': 'En Yeni',
    'members': 'Üye Sayısı',
    'activity': 'Aktivite',
    'name': 'İsim',
  },
};

export default function FilterChips({ filters, onRemoveFilter }: FilterChipsProps) {
  const activeFilters: FilterChip[] = Object.entries(filters)
    .filter(([key, value]) => value && value !== '' && key !== 'sortOrder')
    .map(([key, value]) => ({
      key,
      label: filterLabels[key] || key,
      value: filterValueLabels[key]?.[value] || value,
    }));

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-sm font-semibold text-gray-600 py-2">
        Aktif Filtreler:
      </span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onRemoveFilter(filter.key)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors group"
        >
          <span>
            {filter.label}: <span className="font-bold">{filter.value}</span>
          </span>
          <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        </button>
      ))}
    </div>
  );
}
