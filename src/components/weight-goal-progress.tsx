'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalProgress } from '@/components/ui/progress';
import { TrendingDown, Target, Calendar } from 'lucide-react';

interface WeightGoalProgressProps {
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
  startDate?: Date;
  className?: string;
}

export function WeightGoalProgress({ 
  startWeight, 
  currentWeight, 
  goalWeight,
  startDate,
  className 
}: WeightGoalProgressProps) {
  const totalToLose = startWeight - goalWeight;
  const lostSoFar = startWeight - currentWeight;
  const remaining = currentWeight - goalWeight;
  const percentage = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0;

  const daysSinceStart = startDate 
    ? Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const avgWeeklyLoss = daysSinceStart && daysSinceStart > 0
    ? (lostSoFar / daysSinceStart) * 7
    : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Kilo Hedefi İlerlemesi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ana Progress */}
        <GoalProgress
          current={lostSoFar}
          target={totalToLose}
          unit="kg"
          label="Verilen Kilo"
          className="border-0 shadow-none p-0"
        />

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">
              Başlangıç
            </div>
            <div className="text-xl font-bold text-blue-900">
              {startWeight}
              <span className="text-xs ml-1">kg</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xs font-semibold text-green-600 uppercase mb-1">
              Şu An
            </div>
            <div className="text-xl font-bold text-green-900">
              {currentWeight}
              <span className="text-xs ml-1">kg</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-xs font-semibold text-purple-600 uppercase mb-1">
              Hedef
            </div>
            <div className="text-xl font-bold text-purple-900">
              {goalWeight}
              <span className="text-xs ml-1">kg</span>
            </div>
          </div>
        </div>

        {/* Detaylar */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <TrendingDown className="h-4 w-4" />
              Verilen Kilo
            </span>
            <span className="font-bold text-green-600">
              {lostSoFar.toFixed(1)} kg
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <Target className="h-4 w-4" />
              Kalan Kilo
            </span>
            <span className="font-bold text-orange-600">
              {remaining > 0 ? `${remaining.toFixed(1)} kg` : 'Hedefe ulaştın! 🎉'}
            </span>
          </div>

          {daysSinceStart !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                Geçen Süre
              </span>
              <span className="font-bold text-blue-600">
                {daysSinceStart} gün
              </span>
            </div>
          )}

          {avgWeeklyLoss !== null && avgWeeklyLoss > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Haftalık Ortalama
              </span>
              <span className="font-bold text-purple-600">
                {avgWeeklyLoss.toFixed(2)} kg/hafta
              </span>
            </div>
          )}
        </div>

        {/* Motivasyon Mesajı */}
        {percentage >= 100 ? (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-1">🎉</div>
            <div className="font-bold">Tebrikler! Hedefe ulaştın!</div>
          </div>
        ) : percentage >= 75 ? (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="font-bold">Harika gidiyorsun! Son spurt!</div>
          </div>
        ) : percentage >= 50 ? (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-1">💪</div>
            <div className="font-bold">Yolun yarısını geçtin!</div>
          </div>
        ) : percentage >= 25 ? (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-1">🚀</div>
            <div className="font-bold">İyi başlangıç! Devam et!</div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-1">💫</div>
            <div className="font-bold">Her yolculuk bir adımla başlar!</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
