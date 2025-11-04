'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Gift,
  ShoppingBag,
  Trophy,
  Gamepad2,
  Calendar,
  Filter,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { CoinTransactionType } from '@prisma/client';

/**
 * Coin İşlem Geçmişi Bileşeni
 * 
 * Kullanıcının coin kazanma ve harcama geçmişini gösterir
 * Filtreleme ve sayfalama özellikleri içerir
 */

interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: CoinTransactionType;
  reason: string;
  metadata: any;
  createdAt: Date | string;
}

interface CoinTransactionHistoryProps {
  filter?: 'all' | 'EARNED' | 'SPENT' | 'BONUS' | 'REFUND';
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

// İşlem tipi renkleri ve ikonları
const TRANSACTION_CONFIG = {
  EARNED: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: TrendingUp,
    label: 'Kazanıldı',
  },
  SPENT: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: TrendingDown,
    label: 'Harcandı',
  },
  BONUS: {
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: Gift,
    label: 'Bonus',
  },
  REFUND: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: TrendingUp,
    label: 'İade',
  },
};

// İşlem nedeni ikonları
const REASON_ICONS: Record<string, any> = {
  QUEST_DAILY: Trophy,
  QUEST_WEEKLY: Trophy,
  QUEST_SPECIAL: Trophy,
  GAME_CALORIE_GUESS: Gamepad2,
  GAME_MEMORY_CARDS: Gamepad2,
  GAME_QUICK_CLICK: Gamepad2,
  STREAK_BONUS: Calendar,
  PURCHASE_REWARD: ShoppingBag,
  REWARD_PURCHASE: ShoppingBag,
};

export default function CoinTransactionHistory({
  filter: initialFilter = 'all',
  limit = 20,
  showFilters = true,
  className = '',
}: CoinTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [filter, setFilter] = useState(initialFilter);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  // İşlemleri yükle
  const loadTransactions = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setOffset(0);
      } else {
        setIsLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offset;
      const filterParam = filter !== 'all' ? `&type=${filter}` : '';
      
      const response = await fetch(
        `/api/coins/transactions?limit=${limit}&offset=${currentOffset}${filterParam}`
      );

      if (!response.ok) {
        throw new Error('İşlem geçmişi yüklenemedi');
      }

      const result = await response.json();

      if (result.success) {
        const newTransactions = result.data.transactions.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        }));

        if (reset) {
          setTransactions(newTransactions);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);
        }

        setHasMore(result.data.hasMore);
        setTotal(result.data.total);
        setOffset(currentOffset + limit);
      }
    } catch (error) {
      console.error('İşlem geçmişi yükleme hatası:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // İlk yükleme ve filtre değişikliği
  useEffect(() => {
    loadTransactions(true);
  }, [filter]);

  // Tarih formatla
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} dakika önce`;
      }
      return `${hours} saat önce`;
    }

    if (days === 1) return 'Dün';
    if (days < 7) return `${days} gün önce`;

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // İşlem açıklaması
  const getTransactionDescription = (transaction: CoinTransaction) => {
    const reasonMap: Record<string, string> = {
      QUEST_DAILY: 'Günlük görev tamamlandı',
      QUEST_WEEKLY: 'Haftalık görev tamamlandı',
      QUEST_SPECIAL: 'Özel görev tamamlandı',
      GAME_CALORIE_GUESS: 'Kalori Tahmin oyunu',
      GAME_MEMORY_CARDS: 'Hafıza Kartları oyunu',
      GAME_QUICK_CLICK: 'Hızlı Tıklama oyunu',
      STREAK_BONUS: 'Streak bonusu',
      DAILY_LOGIN: 'Günlük giriş ödülü',
      LEVEL_UP: 'Seviye atlama bonusu',
      PURCHASE_REWARD: 'Ödül satın alındı',
      REWARD_PURCHASE: 'Ödül satın alındı',
      REFUND: 'İade',
      ADMIN_GRANT: 'Admin tarafından verildi',
    };

    return reasonMap[transaction.reason] || transaction.reason;
  };

  if (isLoading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filtreler */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrele:
            </span>
            
            {(['all', 'EARNED', 'SPENT', 'BONUS', 'REFUND'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="text-xs"
              >
                {f === 'all' ? 'Tümü' : TRANSACTION_CONFIG[f].label}
              </Button>
            ))}
          </div>

          {/* Toplam */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Toplam {total} işlem
          </div>
        </Card>
      )}

      {/* İşlem listesi */}
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Henüz işlem geçmişi yok</p>
            </div>
          </Card>
        ) : (
          transactions.map((transaction, index) => {
            const config = TRANSACTION_CONFIG[transaction.type];
            const Icon = config.icon;
            const ReasonIcon = REASON_ICONS[transaction.reason] || Coins;

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`
                    p-4 border-l-4 ${config.border}
                    hover:shadow-md transition-shadow
                  `}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Sol: İkon ve açıklama */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <ReasonIcon className={`w-5 h-5 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {getTransactionDescription(transaction)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.createdAt as Date)}
                        </p>
                      </div>
                    </div>

                    {/* Sağ: Miktar */}
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span
                        className={`text-lg font-bold ${config.color} whitespace-nowrap`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Daha fazla yükle */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => loadTransactions(false)}
            disabled={isLoadingMore}
            className="gap-2"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Daha Fazla Göster
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
