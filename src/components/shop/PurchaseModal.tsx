'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Reward } from './RewardCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Coins,
  ShoppingCart,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';

/**
 * Satın Alma Onay Modal'ı
 * 
 * Ödül satın almadan önce kullanıcıdan onay alır
 * Ödül detaylarını ve fiyatını gösterir
 */

interface PurchaseModalProps {
  reward: Reward | null;
  userCoins: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPurchasing: boolean;
}

export default function PurchaseModal({
  reward,
  userCoins,
  isOpen,
  onClose,
  onConfirm,
  isPurchasing,
}: PurchaseModalProps) {
  if (!reward) return null;

  const remainingCoins = userCoins - reward.price;
  const canAfford = remainingCoins >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Satın Alma Onayı
          </DialogTitle>
          <DialogDescription>
            Bu ödülü satın almak istediğinizden emin misiniz?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ödül bilgileri */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {reward.imageUrl ? (
              <img
                src={reward.imageUrl}
                alt={reward.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {reward.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {reward.description}
              </p>
            </div>
          </div>

          {/* Fiyat bilgileri */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fiyat
              </span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {reward.price.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mevcut Bakiye
              </span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {userCoins.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            <div
              className={`
                flex items-center justify-between p-3 rounded-lg
                ${
                  canAfford
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }
              `}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Kalan Bakiye
              </span>
              <div className="flex items-center gap-2">
                {canAfford ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={`
                    text-lg font-bold
                    ${
                      canAfford
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  `}
                >
                  {remainingCoins.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Uyarı mesajı */}
          {!canAfford && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Yetersiz Bakiye</p>
                <p className="mt-1">
                  Bu ödülü satın almak için{' '}
                  <span className="font-bold">
                    {Math.abs(remainingCoins).toLocaleString('tr-TR')}
                  </span>{' '}
                  coin daha kazanmanız gerekiyor.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPurchasing}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            İptal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canAfford || isPurchasing}
            className={`
              flex-1
              ${
                canAfford
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              }
            `}
          >
            {isPurchasing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Satın Alınıyor...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Satın Al
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
