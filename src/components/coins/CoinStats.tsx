'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

/**
 * Coin İstatistikleri Bileşeni
 * 
 * Kullanıcının coin kazanma ve harcama istatistiklerini gösterir
 * Günlük, haftalık, aylık ve tüm zamanlar için analiz sunar
 */

interface CoinStatsData {
  period: 'daily' | 'weekly' | 'monthly' | 'all';
  earned: number;
  spent: number;
  refunded: number;
  net: number;
  currentBalance: number;
  transactionCount: number;
}

interface CoinStatsProps {
  userId?: string;
  defaultPeriod?: 'daily' | 'weekly' | 'monthly' | 'all';
  className?: string;
}

const PERIOD_LABELS = {
  daily: 'Bugün',
  weekly: 'Bu Hafta',
  monthly: 'Bu Ay',
  all: 'Tüm Zamanlar',
};

const PERIOD_ICONS = {
  daily: Calendar,
  weekly: Calendar,
  monthly: Calendar,
  all: BarChart3,
};

export default function CoinStats({
  userId,
  defaultPeriod = 'all',
  className = '',
}: CoinStatsProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>(
    defaultPeriod
  );
  const [stats, setStats] = useState<CoinStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // İstatistikleri yükle
  const loadStats = async (selectedPeriod: typeof period) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/coins/stats?period=${selectedPeriod}`);

      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yükleme ve period değişikliği
  useEffect(() => {
    loadStats(period);
  }, [period]);

  // Yüzde hesapla
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
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

  if (!stats) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>İstatistikler yüklenemedi</p>
        </div>
      </Card>
    );
  }

  const PeriodIcon = PERIOD_ICONS[period];
  const earnedPercentage = calculatePercentage(
    stats.earned,
    stats.earned + stats.spent
  );
  const spentPercentage = calculatePercentage(
    stats.spent,
    stats.earned + stats.spent
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Period seçici */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dönem:
          </span>

          {(['daily', 'weekly', 'monthly', 'all'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="text-xs"
            >
              {PERIOD_LABELS[p]}
            </Button>
          ))}
        </div>
      </Card>

      {/* Ana istatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mevcut bakiye */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Mevcut Bakiye
              </span>
              <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.currentBalance.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Toplam coin
            </div>
          </Card>
        </motion.div>

        {/* Kazanılan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Kazanılan
              </span>
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              +{stats.earned.toLocaleString('tr-TR')}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              {earnedPercentage}% toplam işlem
            </div>
          </Card>
        </motion.div>

        {/* Harcanan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Harcanan
              </span>
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              -{stats.spent.toLocaleString('tr-TR')}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <ArrowDownRight className="w-3 h-3" />
              {spentPercentage}% toplam işlem
            </div>
          </Card>
        </motion.div>

        {/* Net değişim */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className={`
              p-6 border-2
              ${
                stats.net >= 0
                  ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20'
                  : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Değişim
              </span>
              <BarChart3
                className={`
                  w-5 h-5
                  ${
                    stats.net >= 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }
                `}
              />
            </div>
            <div
              className={`
                text-3xl font-bold
                ${
                  stats.net >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-orange-600 dark:text-orange-400'
                }
              `}
            >
              {stats.net >= 0 ? '+' : ''}
              {stats.net.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.transactionCount} işlem
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Detaylı analiz */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Detaylı Analiz
        </h3>

        <div className="space-y-4">
          {/* Kazanç/Harcama oranı */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Kazanç / Harcama Oranı
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {earnedPercentage}% / {spentPercentage}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div
                  className="bg-green-500"
                  style={{ width: `${earnedPercentage}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${spentPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ortalama işlem */}
          {stats.transactionCount > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Ortalama Kazanç
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  +{Math.round(stats.earned / stats.transactionCount).toLocaleString('tr-TR')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Ortalama Harcama
                </div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  -{Math.round(stats.spent / stats.transactionCount).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          )}

          {/* İade bilgisi */}
          {stats.refunded > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  İade Edilen
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  +{stats.refunded.toLocaleString('tr-TR')} coin
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
