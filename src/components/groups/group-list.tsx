'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Trophy, TrendingDown, Dumbbell, Apple, Heart, Lock, ChevronRight, Sparkles } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  goalType: string;
  imageUrl?: string;
  isPrivate: boolean;
  _count: {
    members: number;
    challenges: number;
  };
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalType, setGoalType] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [goalType]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (goalType) params.append('goalType', goalType);
      
      const res = await fetch(`/api/groups?${params}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Gruplar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2 overflow-x-auto">
        <button
          onClick={() => setGoalType('')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            !goalType 
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
              onClick={() => setGoalType(key)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                goalType === key
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const config = goalTypeConfig[group.goalType as keyof typeof goalTypeConfig] || goalTypeConfig['weight-loss'];
          const Icon = config.icon;
          
          return (
            <Link
              key={group.id}
              href={`/groups/${group.slug}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
            >
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
                  <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <Icon className="w-20 h-20 text-white/30" />
                  </div>
                )}
                
                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                  {group.isPrivate && (
                    <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                      <Lock className="w-3 h-3" />
                      Özel
                    </span>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                  {group.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold">{group._count.members}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{group._count.challenges}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz grup bulunmuyor</h3>
          <p className="text-gray-600 mb-6">İlk grubu sen oluştur ve topluluğu büyüt!</p>
          <Link
            href="/groups/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Grup Oluştur
          </Link>
        </div>
      )}
    </div>
  );
}
