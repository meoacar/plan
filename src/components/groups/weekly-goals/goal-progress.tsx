'use client';

import { motion } from 'framer-motion';

interface GoalProgressProps {
  current: number;
  target: number;
  percentage: number;
}

export function GoalProgress({ current, target, percentage }: GoalProgressProps) {
  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        />
      </div>

      {/* Percentage */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">İlerleme</span>
        <span className="font-semibold text-gray-900">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
