'use client';

import { useState, useEffect } from 'react';
import { X, Filter, Target, TrendingUp, Award, MapPin, Users } from 'lucide-react';

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

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
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

export default function FilterModal({ isOpen, onClose, filters, onApplyFilters }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: FilterOptions = {
      goalType: '',
      minMembers: '',
      maxMembers: '',
      activityLevel: '',
      city: '',
      category: '',
      level: '',
      gender: '',
      ageGroup: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocalFilters(clearedFilters);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Filtreler</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Goal Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Hedef Türü
              </label>
              <div className="grid grid-cols-2 gap-2">
                {goalTypes.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('goalType', option.value)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      localFilters.goalType === option.value
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Aktivite Seviyesi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activityLevels.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('activityLevel', option.value)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      localFilters.activityLevel === option.value
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Seviye
              </label>
              <div className="grid grid-cols-2 gap-2">
                {levels.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('level', option.value)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      localFilters.level === option.value
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Member Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Üye Sayısı
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Minimum</label>
                  <input
                    type="number"
                    value={localFilters.minMembers}
                    onChange={(e) => handleFilterChange('minMembers', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Maksimum</label>
                  <input
                    type="number"
                    value={localFilters.maxMembers}
                    onChange={(e) => handleFilterChange('maxMembers', e.target.value)}
                    placeholder="∞"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Şehir
              </label>
              <input
                type="text"
                value={localFilters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Örn: İstanbul, Ankara, İzmir"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sıralama
              </label>
              <select
                value={localFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              onClick={handleClear}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Temizle
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Uygula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
