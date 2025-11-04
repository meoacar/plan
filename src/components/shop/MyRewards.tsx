'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gift,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Package,
  Sparkles,
  Calendar,
  Copy,
  ExternalLink,
} from 'lucide-react';

/**
 * Kullanıcının Ödülleri Bileşeni
 * 
 * Kullanıcının satın aldığı tüm ödülleri gösterir
 * Aktif, kullanılmış ve süresi dolmuş ödülleri kategorize eder
 * Ödül aktivasyonu ve kod gösterimi içerir
 */

interface UserReward {
  id: string;
  rewardId: string;
  reward: {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
    imageUrl: string | null;
  };
  coinsPaid: number;
  purchasedAt: string;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  isActive: boolean;
  rewardData: any;
}

interface MyRewardsProps {
  initialRewards?: UserReward[];
}

export default function MyRewards({ initialRewards = [] }: MyRewardsProps) {
  const [rewards, setRewards] = useState<UserReward[]>(initialRewards);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Ödülleri yükle
  const loadRewards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/shop/my-rewards');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ödüller yüklenemedi');
      }

      setRewards(data.data.rewards);
    } catch (err) {
      console.error('Ödül yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    if (initialRewards.length === 0) {
      loadRewards();
    }
  }, []);

  // Ödülleri kategorilere ayır
  const activeRewards = rewards.filter((r) => r.isActive && !r.isUsed);
  const usedRewards = rewards.filter((r) => r.isUsed && !r.isExpired);
  const expiredRewards = rewards.filter((r) => r.isExpired);

  // Kodu kopyala
  const handleCopyCode = (code: string, rewardId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(rewardId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Süre formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Kalan süreyi hesapla
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Süresi doldu';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} gün ${hours} saat kaldı`;
    }

    return `${hours} saat kaldı`;
  };

  // Ödül kartı render
  const renderRewardCard = (userReward: UserReward) => {
    const hasCode =
      userReward.rewardData &&
      typeof userReward.rewardData === 'object' &&
      'code' in userReward.rewardData;

    return (
      <motion.div
        key={userReward.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="p-6 space-y-4">
            {/* Üst kısım: Görsel ve bilgiler */}
            <div className="flex items-start gap-4">
              {userReward.reward.imageUrl ? (
                <img
                  src={userReward.reward.imageUrl}
                  alt={userReward.reward.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <Gift className="w-10 h-10 text-gray-400" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {userReward.reward.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {userReward.reward.description}
                    </p>
                  </div>

                  {/* Durum rozeti */}
                  {userReward.isActive && !userReward.isUsed && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>Aktif</span>
                    </div>
                  )}

                  {userReward.isUsed && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                      <Check className="w-3 h-3" />
                      <span>Kullanıldı</span>
                    </div>
                  )}

                  {userReward.isExpired && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      <span>Süresi Doldu</span>
                    </div>
                  )}
                </div>

                {/* Tarih bilgileri */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Satın alındı: {formatDate(userReward.purchasedAt)}</span>
                  </div>

                  {userReward.expiresAt && !userReward.isExpired && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeRemaining(userReward.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kod gösterimi (fiziksel ödüller için) */}
            {hasCode && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Ödül Kodunuz
                    </div>
                    <div className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                      {userReward.rewardData.code}
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      handleCopyCode(userReward.rewardData.code, userReward.id)
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copiedCode === userReward.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopyala
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Bu kodu kullanarak ödülünüzü talep edebilirsiniz
                </p>
              </div>
            )}

            {/* Kullanım bilgisi */}
            {userReward.isUsed && userReward.usedAt && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Kullanıldı: {formatDate(userReward.usedAt)}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
          <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ödüllerim
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Satın aldığın tüm ödülleri buradan yönetebilirsin
          </p>
        </div>
      </div>

      {/* Yükleme durumu */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Hata durumu */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <Button
            onClick={loadRewards}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Ödül listesi */}
      {!isLoading && !error && (
        <>
          {rewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Henüz Ödülün Yok
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Mağazadan ödül satın alarak koleksiyonunu oluşturmaya başla!
              </p>
              <Button
                onClick={() => (window.location.href = '/shop')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Gift className="w-4 h-4 mr-2" />
                Mağazaya Git
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Aktif ({activeRewards.length})
                </TabsTrigger>
                <TabsTrigger value="used" className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Kullanılmış ({usedRewards.length})
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Süresi Dolmuş ({expiredRewards.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4 mt-6">
                {activeRewards.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    Aktif ödülün bulunmuyor
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {activeRewards.map((reward) => renderRewardCard(reward))}
                  </AnimatePresence>
                )}
              </TabsContent>

              <TabsContent value="used" className="space-y-4 mt-6">
                {usedRewards.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    Kullanılmış ödülün bulunmuyor
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {usedRewards.map((reward) => renderRewardCard(reward))}
                  </AnimatePresence>
                )}
              </TabsContent>

              <TabsContent value="expired" className="space-y-4 mt-6">
                {expiredRewards.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    Süresi dolmuş ödülün bulunmuyor
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {expiredRewards.map((reward) => renderRewardCard(reward))}
                  </AnimatePresence>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
