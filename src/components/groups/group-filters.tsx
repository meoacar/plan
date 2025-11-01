'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, Users, TrendingUp, MapPin, Target, Award } from 'lucide-react';

interface FilterOptions {
  goalType: string;
  minMembers: string;
  maxMembers: string;
  activityLevel: string;
  city: string;
  category: string;
  level: string;
  gender: string;
  ageGroup: string;
  sortBy: string;
  sortOrder: string;
}

interface GroupFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const goalTypes = [
  { value: '', label: 'Tümü' },
  { value: 'weight-loss', label: 'Kilo Verme' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'healthy-eating', label: 'Sağlıklı Beslenme' },
  { value: 'muscle-gain', label: 'Kas Kazanımı' },
];

const activityLevels = [
  { value: '', label: 'Tümü' },
  { value: 'high', label: 'Yüksek Aktivite' },
  { value: 'medium', label: 'Orta Aktivite' },
  { value: 'low', label: 'Düşük Aktivite' },
];

const levels = [
  { value: '', label: 'Tümü' },
  { value: 'beginner', label: 'Başlangıç' },
  { value: 'advanced', label: 'İleri Seviye' },
];

const sortOptions = [
  { value: 'createdAt', label: 'En Yeni' },
  { value: 'members', label: 'Üye Sayısı' },
  { value: 'activity', label: 'Aktivite' },
  { value: 'name', label: 'İsim' },
];

export default function GroupFilters({ filters, onFilterChange, onClearFilters }: GroupFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600" />
          <span className="font-semibold">Filtreler</span>
          {activeFilterCount > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filters */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0 space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Goal Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Hedef Türü
            </label>
            <select
              value={filters.goalType}
              onChange={(e) => handleFilterChange('goalType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {goalTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Aktivite Seviyesi
            </label>
            <select
              value={filters.activityLevel}
              onChange={(e) => handleFilterChange('activityLevel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {activityLevels.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Seviye
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {levels.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sıralama
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {/* Min Members */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min. Üye Sayısı
            </label>
            <input
              type="number"
              value={filters.minMembers}
              onChange={(e) => handleFilterChange('minMembers', e.target.value)}
              placeholder="Örn: 10"
              min="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maks. Üye Sayısı
            </label>
            <input
              type="number"
              value={filters.maxMembers}
              onChange={(e) => handleFilterChange('maxMembers', e.target.value)}
              placeholder="Örn: 100"
              min="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              Şehir
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Örn: İstanbul"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
