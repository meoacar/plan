'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Coin Bakiyesi Bileşeni
 * 
 * Kullanıcının coin bakiyesini gösterir
 * Header'da her sayfada görünür
 * Animasyonlu artış/azalış efekti içerir
 */

interface CoinBalanceProps {
  coins?: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CoinBalance({
  coins: initialCoins,
  showAnimation = true,
  size = 'md',
  className = '',
}: CoinBalanceProps) {
  const [coins, setCoins] = useState(initialCoins ?? 0);
  const [previousCoins, setPreviousCoins] = useState(initialCoins ?? 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);

  // Coin değişikliğini takip et
  useEffect(() => {
    if (initialCoins !== undefined && initialCoins !== previousCoins) {
      const change = initialCoins - previousCoins;
      
      if (showAnimation && change !== 0) {
        setChangeAmount(change);
        setIsAnimating(true);
        
        // Animasyonu bitir
        setTimeout(() => {
          setIsAnimating(false);
          setChangeAmount(0);
        }, 2000);
      }
      
      setPreviousCoins(initialCoins);
      setCoins(initialCoins);
    }
  }, [initialCoins, previousCoins, showAnimation]);

  // Boyut ayarları
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-4 h-4',
      text: 'text-sm',
      badge: 'text-xs px-1.5 py-0.5',
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'w-5 h-5',
      text: 'text-base',
      badge: 'text-xs px-2 py-1',
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'w-6 h-6',
      text: 'text-lg',
      badge: 'text-sm px-2.5 py-1',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`
          flex items-center gap-2 
          bg-gradient-to-r from-yellow-500/10 to-amber-500/10 
          border-2 border-yellow-500/20 
          rounded-full ${sizes.container}
          backdrop-blur-sm
        `}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        {/* Coin ikonu */}
        <motion.div
          animate={isAnimating ? { rotate: [0, 360] } : {}}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Coins className={`${sizes.icon} text-yellow-600 dark:text-yellow-400`} />
        </motion.div>

        {/* Bakiye */}
        <motion.span
          className={`font-bold text-gray-900 dark:text-white ${sizes.text}`}
          key={coins}
          initial={showAnimation ? { scale: 1.2, color: '#eab308' } : {}}
          animate={{ scale: 1, color: 'currentColor' }}
          transition={{ duration: 0.3 }}
        >
          {coins.toLocaleString('tr-TR')}
        </motion.span>
      </motion.div>

      {/* Değişiklik animasyonu */}
      <AnimatePresence>
        {isAnimating && changeAmount !== 0 && (
          <motion.div
            className={`
              absolute -top-8 left-1/2 -translate-x-1/2
              flex items-center gap-1
              ${sizes.badge}
              rounded-full
              font-bold
              shadow-lg
              ${
                changeAmount > 0
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }
            `}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            {changeAmount > 0 ? (
              <>
                <TrendingUp className="w-3 h-3" />
                <span>+{changeAmount}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3" />
                <span>{changeAmount}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parıltı efekti */}
      {isAnimating && changeAmount > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full bg-yellow-400/30"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </div>
  );
}
