'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RewardCard, { Reward } from './RewardCard';
import PurchaseModal from './PurchaseModal';
import CoinBalance from '../coins/CoinBalance';
import { Select } from '../ui/select';
import {
  Store,
  Filter,
  SortAsc,
  Search,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * Ödül Mağazası Bileşeni
 * 
 * Tüm ödülleri listeler
 * Kategori filtreleme, sıralama ve arama özellikleri içerir
 * Satın alma modal'ı yönetir
 */

interface RewardShopProps {
  initialRewards?: Reward[];
  initialUserCoins?: number;
  ownedRewardIds?: string[];
}

// Kategori seçenekleri
const CATEGORIES = [
  { value: 'all', label: 'Tümü' },
  { value: 'DIGITAL', label: 'Dijital' },
  { value: 'PHYSICAL', label: 'Fiziksel' },
  { value: 'PREMIUM', label: 'Premium' },
];

// Sıralama seçenekleri
const SORT_OPTIONS = [
  { value: 'order', label: 'Varsayılan' },
  { value: 'price', label: 'Fiyat (Düşükten Yükseğe)' },
  { value: 'popular', label: 'Popüler' },
  { value: 'new', label: 'Yeni Eklenenler' },
];

export default function RewardShop({
  initialRewards = [],
  initialUserCoins = 0,
  ownedRewardIds = [],
}: RewardShopProps) {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [userCoins, setUserCoins] = useState(initialUserCoins);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtreleme ve sıralama
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('order');
  const [searchQuery, setSearchQuery] = useState('');

  // Satın alma modal
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchasingRewardId, setPurchasingRewardId] = useState<string | null>(null);

  // Ödülleri yükle
  const loadRewards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      params.append('sortBy', selectedSort);

      const response = await fetch(`/api/shop/rewards?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ödüller yüklenemedi');
      }

      setRewards(data.data.rewards);
      setUserCoins(data.data.userCoins);
    } catch (err) {
      console.error('Ödül yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // İlk yükleme ve filtre değişikliklerinde yeniden yükle
  useEffect(() => {
    if (initialRewards.length === 0) {
      loadRewards();
    }
  }, [selectedCategory, selectedSort]);

  // Arama filtresi
  const filteredRewards = rewards.filter((reward) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      reward.name.toLowerCase().includes(query) ||
      reward.description.toLowerCase().includes(query)
    );
  });

  // Satın alma işlemi
  const handlePurchase = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (reward) {
      setSelectedReward(reward);
    }
  };

  // Satın alma onayı
  const handleConfirmPurchase = async () => {
    if (!selectedReward) return;

    try {
      setIsPurchasing(true);
      setPurchasingRewardId(selectedReward.id);

      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: selectedReward.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Satın alma başarısız');
      }

      // Başarılı satın alma
      setUserCoins(data.data.remainingCoins);
      
      // Ödül listesini güncelle
      setRewards((prev) =>
        prev.map((r) =>
          r.id === selectedReward.id
            ? {
                ...r,
                stock: r.stock !== null ? r.stock - 1 : null,
                inStock: r.stock !== null ? r.stock - 1 > 0 : true,
                canAfford: data.data.remainingCoins >= r.price,
              }
            : {
                ...r,
                canAfford: data.data.remainingCoins >= r.price,
              }
        )
      );

      // Sahip olunan ödüllere ekle
      ownedRewardIds.push(selectedReward.id);

      // Modal'ı kapat
      setSelectedReward(null);

      // Başarı mesajı (toast veya bildirim ile gösterilebilir)
      alert(`${selectedReward.name} başarıyla satın alındı! 🎉`);
    } catch (err) {
      console.error('Satın alma hatası:', err);
      alert(err instanceof Error ? err.message : 'Satın alma başarısız');
    } finally {
      setIsPurchasing(false);
      setPurchasingRewardId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve coin bakiyesi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Store className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ödül Mağazası
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Coinlerinle harika ödüller satın al
            </p>
          </div>
        </div>

        <CoinBalance coins={userCoins} showAnimation={true} size="lg" />
      </div>

      {/* Filtreler ve arama */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Arama */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Ödül ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Kategori filtresi */}
        <Select
          value={selectedCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>

        {/* Sıralama */}
        <Select
          value={selectedSort}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSort(e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
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
          {filteredRewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ödül Bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? 'Arama kriterlerinize uygun ödül bulunamadı'
                  : 'Bu kategoride henüz ödül bulunmuyor'}
              </p>
            </div>
          ) : (
            <>
              {/* Ödül sayısı */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredRewards.length} ödül bulundu
              </div>

              {/* Ödül grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredRewards.map((reward) => (
                    <motion.div
                      key={reward.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RewardCard
                        reward={reward}
                        userCoins={userCoins}
                        onPurchase={handlePurchase}
                        isPurchasing={purchasingRewardId === reward.id}
                        isOwned={ownedRewardIds.includes(reward.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </>
      )}

      {/* Satın alma modal */}
      <PurchaseModal
        reward={selectedReward}
        userCoins={userCoins}
        isOpen={selectedReward !== null}
        onClose={() => setSelectedReward(null)}
        onConfirm={handleConfirmPurchase}
        isPurchasing={isPurchasing}
      />
    </div>
  );
}
