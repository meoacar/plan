'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Coins,
  ShoppingCart,
  Check,
  Lock,
  Package,
  Sparkles,
  Crown,
  Gift,
  Palette,
  Image as ImageIcon,
  Frame,
  Zap,
  BarChart3,
  User,
} from 'lucide-react';

/**
 * Ödül Kartı Bileşeni
 * 
 * Mağazada tek bir ödülü gösterir
 * Ödül görseli, adı, açıklama, fiyat ve satın alma butonu içerir
 */

export interface Reward {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  stock: number | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  purchaseCount?: number;
  inStock: boolean;
  canAfford: boolean;
}

interface RewardCardProps {
  reward: Reward;
  userCoins: number;
  onPurchase: (rewardId: string) => void;
  isPurchasing?: boolean;
  isOwned?: boolean;
}

// Ödül tipi ikonları
const REWARD_TYPE_ICONS: Record<string, any> = {
  BADGE: Crown,
  THEME: Palette,
  AVATAR: ImageIcon,
  FRAME: Frame,
  DISCOUNT_CODE: Gift,
  GIFT_CARD: Gift,
  AD_FREE: Zap,
  PREMIUM_STATS: BarChart3,
  CUSTOM_PROFILE: User,
};

// Ödül tipi renkleri
const REWARD_TYPE_COLORS: Record<string, string> = {
  BADGE: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20',
  THEME: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
  AVATAR: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
  FRAME: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
  DISCOUNT_CODE: 'from-red-500/10 to-rose-500/10 border-red-500/20',
  GIFT_CARD: 'from-orange-500/10 to-amber-500/10 border-orange-500/20',
  AD_FREE: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
  PREMIUM_STATS: 'from-teal-500/10 to-cyan-500/10 border-teal-500/20',
  CUSTOM_PROFILE: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
};

// Ödül tipi etiketleri
const REWARD_TYPE_LABELS: Record<string, string> = {
  BADGE: 'Rozet',
  THEME: 'Tema',
  AVATAR: 'Avatar',
  FRAME: 'Çerçeve',
  DISCOUNT_CODE: 'İndirim Kodu',
  GIFT_CARD: 'Hediye Çeki',
  AD_FREE: 'Reklamsız',
  PREMIUM_STATS: 'Premium İstatistikler',
  CUSTOM_PROFILE: 'Özel Profil',
};

export default function RewardCard({
  reward,
  userCoins,
  onPurchase,
  isPurchasing = false,
  isOwned = false,
}: RewardCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const Icon = REWARD_TYPE_ICONS[reward.type] || Gift;
  const colorClass = REWARD_TYPE_COLORS[reward.type] || 'from-gray-500/10 to-gray-600/10 border-gray-500/20';
  const typeLabel = REWARD_TYPE_LABELS[reward.type] || reward.type;

  const canPurchase = reward.inStock && reward.canAfford && !isOwned;

  const handlePurchase = () => {
    if (canPurchase && !isPurchasing) {
      onPurchase(reward.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={`
          relative overflow-hidden border-2 bg-gradient-to-br ${colorClass}
          transition-all duration-300
          ${isHovered ? 'shadow-xl scale-105' : 'shadow-md'}
          ${!reward.inStock ? 'opacity-60' : ''}
        `}
      >
        {/* Öne çıkan rozet */}
        {reward.isFeatured && (
          <div className="absolute top-2 right-2 z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Öne Çıkan</span>
            </motion.div>
          </div>
        )}

        {/* Sahip olunan rozet */}
        {isOwned && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Sahipsin</span>
            </div>
          </div>
        )}

        {/* Stok yok rozet */}
        {!reward.inStock && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Stokta Yok</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Ödül görseli veya ikonu */}
          <div className="relative">
            {reward.imageUrl ? (
              <div className="aspect-square rounded-lg overflow-hidden bg-white/50 dark:bg-gray-800/50">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <Icon className="w-20 h-20 text-gray-400 dark:text-gray-600" />
              </div>
            )}

            {/* Tip badge */}
            <div className="absolute bottom-2 left-2">
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Icon className="w-3 h-3" />
                <span>{typeLabel}</span>
              </div>
            </div>
          </div>

          {/* Ödül bilgileri */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
              {reward.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {reward.description}
            </p>
          </div>

          {/* Fiyat ve stok */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {reward.price.toLocaleString('tr-TR')}
              </span>
            </div>

            {reward.stock !== null && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Package className="w-3 h-3" />
                <span>{reward.stock} adet</span>
              </div>
            )}
          </div>

          {/* Satın alma butonu */}
          <Button
            onClick={handlePurchase}
            disabled={!canPurchase || isPurchasing}
            className={`
              w-full font-semibold
              ${
                canPurchase
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
            size="lg"
          >
            {isPurchasing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Satın Alınıyor...
              </span>
            ) : isOwned ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Sahipsin
              </span>
            ) : !reward.inStock ? (
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Stokta Yok
              </span>
            ) : !reward.canAfford ? (
              <span className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Yetersiz Coin
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Satın Al
              </span>
            )}
          </Button>

          {/* Popülerlik göstergesi */}
          {reward.purchaseCount !== undefined && reward.purchaseCount > 0 && (
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              {reward.purchaseCount} kişi satın aldı
            </div>
          )}
        </div>

        {/* Hover efekti */}
        {isHovered && canPurchase && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </Card>
    </motion.div>
  );
}
