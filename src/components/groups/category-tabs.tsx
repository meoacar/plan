'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layers, Users, Calendar } from 'lucide-react';

interface Category {
  value: string;
  label: string;
  count: number;
}

interface CategoryData {
  level: Category[];
  gender: Category[];
  ageGroup: Category[];
  total: number;
}

export default function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'level' | 'gender' | 'ageGroup' | 'all'>('all');
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    
    // URL'den mevcut filtreleri oku
    const level = searchParams.get('level');
    const gender = searchParams.get('gender');
    const ageGroup = searchParams.get('ageGroup');
    
    if (level) {
      setActiveTab('level');
      setSelectedValue(level);
    } else if (gender) {
      setActiveTab('gender');
      setSelectedValue(gender);
    } else if (ageGroup) {
      setActiveTab('ageGroup');
      setSelectedValue(ageGroup);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/groups/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (type: 'level' | 'gender' | 'ageGroup', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Diğer kategori filtrelerini temizle
    params.delete('level');
    params.delete('gender');
    params.delete('ageGroup');
    
    // Yeni filtreyi ekle
    params.set(type, value);
    params.set('page', '1'); // Sayfayı sıfırla
    
    setActiveTab(type);
    setSelectedValue(value);
    router.push(`/groups?${params.toString()}`);
  };

  const handleShowAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('level');
    params.delete('gender');
    params.delete('ageGroup');
    params.set('page', '1');
    
    setActiveTab('all');
    setSelectedValue(null);
    router.push(`/groups?${params.toString()}`);
  };

  if (loading || !categories) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      {/* Tab Headers */}
      <div className="flex items-center gap-4 mb-6 border-b pb-4 overflow-x-auto">
        <button
          onClick={handleShowAll}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Tüm Gruplar ({categories.total})
        </button>

        <button
          onClick={() => setActiveTab('level')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'level'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Seviye
        </button>

        <button
          onClick={() => setActiveTab('gender')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'gender'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Cinsiyet
        </button>

        <button
          onClick={() => setActiveTab('ageGroup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'ageGroup'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Yaş Grubu
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'level' && (
        <div className="flex flex-wrap gap-2">
          {categories.level.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick('level', cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedValue === cat.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {activeTab === 'gender' && (
        <div className="flex flex-wrap gap-2">
          {categories.gender.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick('gender', cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedValue === cat.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {activeTab === 'ageGroup' && (
        <div className="flex flex-wrap gap-2">
          {categories.ageGroup.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick('ageGroup', cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedValue === cat.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
