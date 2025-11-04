'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

/**
 * Görev İlerleme Bileşeni
 * 
 * Görevin ilerleme durumunu görsel olarak gösterir.
 * Dairesel veya çizgisel progress bar ile animasyonlu güncelleme.
 */

interface QuestProgressProps {
  current: number;
  target: number;
  label?: string;
  variant?: 'linear' | 'circular';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function QuestProgress({
  current,
  target,
  label,
  variant = 'linear',
  showPercentage = true,
  size = 'md',
}: QuestProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  if (variant === 'circular') {
    return <CircularProgress percentage={percentage} isCompleted={isCompleted} size={size} />;
  }

  return (
    <div className="space-y-2">
      {/* Üst bilgi */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {label || 'İlerleme'}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            {current} / {target}
          </span>
          {showPercentage && (
            <span className="text-gray-500 dark:text-gray-400">
              ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            isCompleted
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Tamamlanma animasyonu */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 bg-white/30"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Tamamlanma işareti */}
      {isCompleted && (
        <motion.div
          className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Tamamlandı!</span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Dairesel İlerleme Bileşeni
 */
function CircularProgress({
  percentage,
  isCompleted,
  size,
}: {
  percentage: number;
  isCompleted: boolean;
  size: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: { container: 'w-16 h-16', stroke: 4, text: 'text-xs' },
    md: { container: 'w-24 h-24', stroke: 6, text: 'text-sm' },
    lg: { container: 'w-32 h-32', stroke: 8, text: 'text-base' },
  };

  const config = sizeClasses[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${config.container}`}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Arka plan çemberi */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* İlerleme çemberi */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          strokeLinecap="round"
          className={
            isCompleted
              ? 'text-green-500'
              : 'text-blue-500'
          }
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Merkez metni */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <CheckCircle className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'} text-green-500`} />
          </motion.div>
        ) : (
          <span className={`font-bold ${config.text} text-gray-900 dark:text-white`}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
}
