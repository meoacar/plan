'use client';

import { Sparkles } from 'lucide-react';

interface Props {
  score: number;
}

export default function MatchScore({ score }: Props) {
  // Skoru yüzdeye çevir (max 100 puan)
  const percentage = Math.min(Math.round(score), 100);

  // Renk belirleme
  const getColor = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-blue-500 to-cyan-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  const getTextColor = () => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 60) return 'text-blue-700';
    if (percentage >= 40) return 'text-yellow-700';
    return 'text-gray-700';
  };

  const getLabel = () => {
    if (percentage >= 80) return 'Mükemmel Eşleşme';
    if (percentage >= 60) return 'İyi Eşleşme';
    if (percentage >= 40) return 'Uygun';
    return 'Keşfet';
  };

  return (
    <div className="relative">
      {/* Score Badge */}
      <div className={`bg-gradient-to-r ${getColor()} text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-xs font-bold">%{percentage}</span>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <div className="bg-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
          <p className={`text-xs font-bold ${getTextColor()}`}>
            {getLabel()}
          </p>
        </div>
        {/* Arrow */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
      </div>
    </div>
  );
}
