'use client';

import { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

type Period = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

interface LeaderboardFiltersProps {
  currentPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export function LeaderboardFilters({
  currentPeriod,
  onPeriodChange,
}: LeaderboardFiltersProps) {
  const periods: { value: Period; label: string; icon: React.ReactNode }[] = [
    {
      value: 'WEEKLY',
      label: 'Bu Hafta',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: 'MONTHLY',
      label: 'Bu Ay',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: 'ALL_TIME',
      label: 'Tüm Zamanlar',
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Dönem Seçin</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              currentPeriod === period.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
            }`}
          >
            {period.icon}
            <span className="text-sm">{period.label}</span>
          </button>
        ))}
      </div>

      {/* Dönem Açıklaması */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          {currentPeriod === 'WEEKLY' && (
            <>
              <strong>Bu Hafta:</strong> Pazartesi - Pazar arası aktiviteleriniz
              değerlendirilir.
            </>
          )}
          {currentPeriod === 'MONTHLY' && (
            <>
              <strong>Bu Ay:</strong> Ayın başından bugüne kadar olan aktiviteleriniz
              değerlendirilir.
            </>
          )}
          {currentPeriod === 'ALL_TIME' && (
            <>
              <strong>Tüm Zamanlar:</strong> Gruba katıldığınız günden bugüne kadar
              olan tüm aktiviteleriniz değerlendirilir.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
