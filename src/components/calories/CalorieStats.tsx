'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface CalorieStatsProps {
  date: Date;
  refreshKey: number;
}

interface Stats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goal?: {
    dailyCalories: number;
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
  };
}

export default function CalorieStats({ date, refreshKey }: CalorieStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [date, refreshKey]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Öğünleri getir
      const mealsRes = await fetch(`/api/calories/meals?date=${dateStr}`);
      const meals = await mealsRes.json();

      // Hedefi getir
      const goalRes = await fetch('/api/calories/goal');
      const goal = goalRes.ok ? await goalRes.json() : null;

      // Toplamları hesapla
      const totals = meals.reduce(
        (acc: any, meal: any) => ({
          totalCalories: acc.totalCalories + meal.totalCalories,
          totalProtein: acc.totalProtein + meal.totalProtein,
          totalCarbs: acc.totalCarbs + meal.totalCarbs,
          totalFat: acc.totalFat + meal.totalFat,
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
      );

      setStats({ ...totals, goal });
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6 animate-pulse h-32" />;
  }

  const caloriePercent = stats.goal
    ? Math.round((stats.totalCalories / stats.goal.dailyCalories) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Günlük Özet</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Kalori */}
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.min(caloriePercent, 100) / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(stats.totalCalories)}
              </span>
              <span className="text-xs text-gray-500">
                {stats.goal ? `/ ${stats.goal.dailyCalories}` : 'kcal'}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">Kalori</p>
          {stats.goal && (
            <p className="text-xs text-gray-500">
              Kalan: {Math.max(0, stats.goal.dailyCalories - stats.totalCalories)} kcal
            </p>
          )}
        </div>

        {/* Protein */}
        <div className="text-center">
          <div className="w-32 h-32 mx-auto flex flex-col items-center justify-center bg-blue-50 rounded-full">
            <span className="text-2xl font-bold text-blue-600">
              {Math.round(stats.totalProtein)}g
            </span>
            {stats.goal?.dailyProtein && (
              <span className="text-xs text-gray-500">
                / {stats.goal.dailyProtein}g
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">Protein</p>
        </div>

        {/* Karbonhidrat */}
        <div className="text-center">
          <div className="w-32 h-32 mx-auto flex flex-col items-center justify-center bg-orange-50 rounded-full">
            <span className="text-2xl font-bold text-orange-600">
              {Math.round(stats.totalCarbs)}g
            </span>
            {stats.goal?.dailyCarbs && (
              <span className="text-xs text-gray-500">
                / {stats.goal.dailyCarbs}g
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">Karbonhidrat</p>
        </div>

        {/* Yağ */}
        <div className="text-center">
          <div className="w-32 h-32 mx-auto flex flex-col items-center justify-center bg-purple-50 rounded-full">
            <span className="text-2xl font-bold text-purple-600">
              {Math.round(stats.totalFat)}g
            </span>
            {stats.goal?.dailyFat && (
              <span className="text-xs text-gray-500">
                / {stats.goal.dailyFat}g
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">Yağ</p>
        </div>
      </div>
    </div>
  );
}
