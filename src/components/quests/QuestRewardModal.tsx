'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Coins,
  Star,
  Sparkles,
  X,
  TrendingUp,
} from 'lucide-react';

/**
 * Görev Ödül Modalı
 * 
 * Görev tamamlandığında ödül bilgilerini gösterir.
 * Animasyonlu kutlama efektleri içerir.
 */

interface QuestRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    questTitle: string;
    coins: number;
    xp: number;
    newLevel?: number;
    leveledUp?: boolean;
  } | null;
}

export default function QuestRewardModal({
  isOpen,
  onClose,
  reward,
}: QuestRewardModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && reward) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, reward]);

  if (!reward) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal içeriği */}
        <motion.div
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* Konfeti efekti */}
          {showConfetti && <ConfettiEffect />}

          {/* Kapatma butonu */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Üst kısım - Kutlama */}
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
              className="inline-block"
            >
              <Trophy className="w-20 h-20 text-white drop-shadow-lg" />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-white mt-4 drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Görev Tamamlandı!
            </motion.h2>

            <motion.p
              className="text-white/90 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {reward.questTitle}
            </motion.p>
          </div>

          {/* Alt kısım - Ödüller */}
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Kazandığın Ödüller
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Coin ödülü */}
                <motion.div
                  className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border-2 border-yellow-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                    +{reward.coins}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Coin
                  </div>
                </motion.div>

                {/* XP ödülü */}
                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-500/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    +{reward.xp}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    XP
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Seviye atlama bildirimi */}
            {reward.leveledUp && reward.newLevel && (
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">
                    Seviye {reward.newLevel}'e Yükseldin!
                  </span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </motion.div>
            )}

            {/* Kapatma butonu */}
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
              size="lg"
            >
              Harika!
            </Button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
}

/**
 * Konfeti Efekti
 */
function ConfettiEffect() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'][
      Math.floor(Math.random() * 5)
    ],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            opacity: 0,
            rotate: 360,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}
