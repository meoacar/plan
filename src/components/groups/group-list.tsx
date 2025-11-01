'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Trophy, TrendingDown, Dumbbell, Apple, Heart, Lock, ChevronRight, Sparkles, Filter as FilterIcon, Eye } from 'lucide-react';
import GroupFilters from './group-filters';
import FilterChips from './filter-chips';
import FilterModal from './filter-modal';
import CategoryBadge from './category-badge';
import GroupPreviewModal from './group-preview-modal';

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

const goalTypeConfig = {
  'weight-loss': { 
    label: 'Kilo Verme', 
    icon: TrendingDown, 
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    text: 'text-green-700'
  },
  'fitness': { 
    label: 'Fitness', 
    icon: Dumbbell, 
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700'
  },
  'healthy-eating': { 
    label: 'Sağlıklı Beslenme', 
    icon: Apple, 
    color: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50',
    text: 'text-orange-700'
  },
  'muscle-gain': { 
    label: 'Kas Kazanımı', 
    icon: Heart, 
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50',
    text: 'text-purple-700'
  },
};

export default function GroupList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterOptions>({
    goalType: searchParams.get('goalType') || '',
    minMembers: searchParams.get('minMembers') || '',
    maxMembers: searchParams.get('maxMembers') || '',
    activityLevel: searchParams.get('activityLevel') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    gender: searchParams.get('gender') || '',
    ageGroup: searchParams.get('ageGroup') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  // Update filters when URL changes (for category tabs)
  useEffect(() => {
    const newFilters = {
      goalType: searchParams.get('goalType') || '',
      minMembers: searchParams.get('minMembers') || '',
      maxMembers: searchParams.get('maxMembers') || '',
      activityLevel: searchParams.get('activityLevel') || '',
      city: searchParams.get('city') || '',
      category: searchParams.get('category') || '',
      level: searchParams.get('level') || '',
      gender: searchParams.get('gender') || '',
      ageGroup: searchParams.get('ageGroup') || '',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };
    setFilters(newFilters);
  }, [searchParams]);

  useEffect(() => {
    fetchGroups();
  }, [filters]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add all non-empty filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await fetch(`/api/groups/search?${params}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Gruplar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (newFilters: FilterOptions) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    const queryString = params.toString();
    router.push(`/groups${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters, [key]: '' };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleClearFilters = () => {
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
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        
        {/* Skeleton Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <GroupFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <FilterIcon className="w-5 h-5 text-purple-600" />
          <span className="font-semibold">Filtreler</span>
          {Object.values(filters).filter(v => v && v !== '').length > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              {Object.values(filters).filter(v => v && v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Chips */}
      <FilterChips filters={filters as unknown as { [key: string]: string }} onRemoveFilter={handleRemoveFilter} />

      {/* Quick Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2 overflow-x-auto">
        <button
          onClick={() => handleFilterChange({ ...filters, goalType: '' })}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            !filters.goalType 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Tümü
        </button>
        {Object.entries(goalTypeConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => handleFilterChange({ ...filters, goalType: key })}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filters.goalType === key
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 inline mr-2" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {groups.map((group) => {
          const config = goalTypeConfig[group.goalType as keyof typeof goalTypeConfig] || goalTypeConfig['weight-loss'];
          const Icon = config.icon;
          
          return (
            <div
              key={group.id}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer relative active:scale-95"
              onClick={(e) => {
                // Eğer link tıklanmadıysa önizleme aç
                if (!(e.target as HTMLElement).closest('a')) {
                  setPreviewSlug(group.slug);
                }
              }}
            >
              {/* Image */}
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {group.imageUrl ? (
                  <Image
                    src={group.imageUrl}
                    alt={group.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <Icon className="w-20 h-20 text-white/30" />
                  </div>
                )}
                
                {/* Overlay Badges */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-start gap-2">
                  <span className={`${config.bg} ${config.text} px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm`}>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
                  {group.description}
                </p>

                {/* Category Badges */}
                {(group.level || group.gender || group.ageGroup) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.level && (
                      <CategoryBadge type="level" value={group.level} size="sm" />
                    )}
                    {group.gender && (
                      <CategoryBadge type="gender" value={group.gender} size="sm" />
                    )}
                    {group.ageGroup && (
                      <CategoryBadge type="ageGroup" value={group.ageGroup} size="sm" />
                    )}
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
                        setPreviewSlug(group.slug);
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
        })}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {Object.values(filters).some(v => v && v !== '') 
              ? 'Filtrelere uygun grup bulunamadı' 
              : 'Henüz grup bulunmuyor'}
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.values(filters).some(v => v && v !== '')
              ? 'Farklı filtreler deneyebilir veya yeni bir grup oluşturabilirsiniz.'
              : 'İlk grubu sen oluştur ve topluluğu büyüt!'}
          </p>
          {Object.values(filters).some(v => v && v !== '') ? (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
            >
              Filtreleri Temizle
            </button>
          ) : (
            <Link
              href="/groups/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Grup Oluştur
            </Link>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
      />

      {/* Preview Modal */}
      {previewSlug && (
        <GroupPreviewModal
          slug={previewSlug}
          isOpen={!!previewSlug}
          onClose={() => setPreviewSlug(null)}
        />
      )}
    </div>
  );
}
