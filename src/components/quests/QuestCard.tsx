'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuestProgress from './QuestProgress';
import {
  Trophy,
  Coins,
  Star,
  Clock,
  CheckCircle2,
  Gift,
  Sparkles,
} from 'lucide-react';

/**
 * Görev Kartı Bileşeni
 * 
 * Tek bir görevi gösterir: başlık, açıklama, ilerleme, ödüller
 * Tamamlanan görevler için "Ödülü Al" butonu gösterir
 */

export interface Quest {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'SPECIAL';
  category: string;
  title: string;
  description: string;
  icon?: string;
  targetType: string;
  targetValue: number;
  coinReward: number;
  xpReward: number;
  isActive: boolean;
  priority: number;
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  progress: number;
  completed: boolean;
  assignedAt: Date;
  completedAt?: Date | null;
  expiresAt?: Date | null;
  rewardClaimed: boolean;
  quest: Quest;
}

interface QuestCardProps {
  quest: UserQuest;
  onClaim?: (questId: string) => void;
  isClaimingReward?: boolean;
}

// Görev tipi renkleri
const QUEST_TYPE_COLORS = {
  DAILY: {
    bg: 'from-blue-500/10 to-cyan-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  },
  WEEKLY: {
    bg: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  },
  SPECIAL: {
    bg: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  },
};

// Görev tipi etiketleri
const QUEST_TYPE_LABELS = {
  DAILY: 'Günlük',
  WEEKLY: 'Haftalık',
  SPECIAL: 'Özel',
};

export default function QuestCard({ quest, onClaim, isClaimingReward }: QuestCardProps) {
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  const colors = QUEST_TYPE_COLORS[quest.quest.type];
  const isCompleted = quest.completed;
  const canClaimReward = isCompleted && !quest.rewardClaimed;

  // Kalan süreyi hesapla
  const getTimeRemaining = () => {
    if (!quest.expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(quest.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Süresi doldu';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} gün kaldı`;
    }
    
    if (hours > 0) {
      return `${hours} saat ${minutes} dk kaldı`;
    }
    
    return `${minutes} dk kaldı`;
  };

  const handleClaimReward = async () => {
    if (!onClaim || !canClaimReward) return;

    setShowRewardAnimation(true);
    
    // Animasyon bitince ödülü talep et
    setTimeout(() => {
      onClaim(quest.id);
      setShowRewardAnimation(false);
    }, 1000);
  };

  const timeRemaining = getTimeRemaining();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card
        className={`relative overflow-hidden border-2 ${colors.border} bg-gradient-to-br ${colors.bg} transition-all hover:shadow-lg ${
          isCompleted ? 'ring-2 ring-green-500/50' : ''
        }`}
      >
        {/* Tamamlanma efekti */}
        {isCompleted && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full" />
        )}

        <div className="p-6 space-y-4">
          {/* Üst kısım: Tip badge ve süre */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                {QUEST_TYPE_LABELS[quest.quest.type]}
              </span>
              
              {quest.quest.type === 'SPECIAL' && (
                <Sparkles className="w-4 h-4 text-amber-500" />
              )}
            </div>

            {timeRemaining && !isCompleted && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{timeRemaining}</span>
              </div>
            )}

            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Görev başlığı ve açıklaması */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {quest.quest.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {quest.quest.description}
            </p>
          </div>

          {/* İlerleme */}
          <QuestProgress
            current={quest.progress}
            target={quest.quest.targetValue}
            variant="linear"
            showPercentage={true}
          />

          {/* Ödüller */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Coin</div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {quest.quest.coinReward}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">XP</div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {quest.quest.xpReward}
                </div>
              </div>
            </div>
          </div>

          {/* Ödül talep butonu */}
          {canClaimReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleClaimReward}
                disabled={isClaimingReward}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
                size="lg"
              >
                {isClaimingReward ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ödül Alınıyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Ödülü Al
                  </span>
                )}
              </Button>
            </motion.div>
          )}

          {/* Ödül alındı mesajı */}
          {quest.rewardClaimed && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <Trophy className="w-4 h-4" />
              <span>Ödül alındı!</span>
            </div>
          )}
        </div>

        {/* Ödül animasyonu */}
        {showRewardAnimation && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <Trophy className="w-20 h-20 text-yellow-500" />
            </motion.div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
