'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestCard, { UserQuest } from './QuestCard';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Target,
  Calendar,
  Sparkles,
  Filter,
  CheckCircle,
  Clock,
  Trophy,
} from 'lucide-react';

/**
 * Görev Listesi Bileşeni
 * 
 * Görevleri kategoriye göre gruplar ve listeler.
 * Filtreleme (tamamlanan/devam eden) ve sıralama özellikleri içerir.
 */

interface QuestListProps {
  quests: UserQuest[];
  type: 'daily' | 'weekly' | 'special' | 'all';
  onClaimReward: (questId: string) => void;
  isLoading?: boolean;
  claimingQuestId?: string | null;
}

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'priority' | 'progress' | 'reward';

export default function QuestList({
  quests,
  type,
  onClaimReward,
  isLoading,
  claimingQuestId,
}: QuestListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('priority');

  // Görevleri filtrele ve sırala
  const filteredAndSortedQuests = useMemo(() => {
    let filtered = [...quests];

    // Filtre uygula
    if (filter === 'active') {
      filtered = filtered.filter((q) => !q.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter((q) => q.completed);
    }

    // Sıralama uygula
    filtered.sort((a, b) => {
      // Önce tamamlanmamış görevler
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Sonra seçilen sıralama
      switch (sortBy) {
        case 'priority':
          return b.quest.priority - a.quest.priority;
        
        case 'progress':
          const aProgress = (a.progress / a.quest.targetValue) * 100;
          const bProgress = (b.progress / b.quest.targetValue) * 100;
          return bProgress - aProgress;
        
        case 'reward':
          const aReward = a.quest.coinReward + a.quest.xpReward;
          const bReward = b.quest.coinReward + b.quest.xpReward;
          return bReward - aReward;
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [quests, filter, sortBy]);

  // İstatistikler
  const stats = useMemo(() => {
    const total = quests.length;
    const completed = quests.filter((q) => q.completed).length;
    const active = total - completed;
    const canClaim = quests.filter((q) => q.completed && !q.rewardClaimed).length;

    return { total, completed, active, canClaim };
  }, [quests]);

  // Tip başlıkları ve ikonları
  const typeConfig = {
    daily: {
      title: 'Günlük Görevler',
      icon: Calendar,
      description: 'Her gün yeni görevler',
    },
    weekly: {
      title: 'Haftalık Görevler',
      icon: Target,
      description: 'Haftalık zorluklar',
    },
    special: {
      title: 'Özel Görevler',
      icon: Sparkles,
      description: 'Sınırlı süreli görevler',
    },
    all: {
      title: 'Tüm Görevler',
      icon: Trophy,
      description: 'Tüm aktif görevleriniz',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve istatistikler */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {config.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {config.description}
            </p>
          </div>
        </div>

        {/* İstatistik kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Toplam"
            value={stats.total}
            icon={Target}
            color="blue"
          />
          <StatCard
            label="Aktif"
            value={stats.active}
            icon={Clock}
            color="orange"
          />
          <StatCard
            label="Tamamlanan"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Ödül Bekliyor"
            value={stats.canClaim}
            icon={Trophy}
            color="yellow"
          />
        </div>
      </div>

      {/* Filtre ve sıralama */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filtre butonları */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex gap-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="Tümü"
              count={stats.total}
            />
            <FilterButton
              active={filter === 'active'}
              onClick={() => setFilter('active')}
              label="Aktif"
              count={stats.active}
            />
            <FilterButton
              active={filter === 'completed'}
              onClick={() => setFilter('completed')}
              label="Tamamlanan"
              count={stats.completed}
            />
          </div>
        </div>

        {/* Sıralama */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="priority">Öncelik</option>
            <option value="progress">İlerleme</option>
            <option value="reward">Ödül</option>
          </select>
        </div>
      </div>

      {/* Görev listesi */}
      {filteredAndSortedQuests.length === 0 ? (
        <EmptyState
          icon={<Target className="w-16 h-16" />}
          title="Görev bulunamadı"
          description={
            filter === 'completed'
              ? 'Henüz tamamlanmış göreviniz yok'
              : filter === 'active'
              ? 'Aktif göreviniz yok'
              : 'Henüz görev atanmamış'
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedQuests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <QuestCard
                  quest={quest}
                  onClaim={onClaimReward}
                  isClaimingReward={claimingQuestId === quest.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/**
 * İstatistik Kartı
 */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'orange' | 'green' | 'yellow';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    orange: 'from-orange-500 to-amber-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-amber-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <div className={`p-2 bg-gradient-to-br ${colorClasses[color]} rounded-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

/**
 * Filtre Butonu
 */
function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label} <span className="ml-1 opacity-75">({count})</span>
    </button>
  );
}
