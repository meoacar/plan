'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyMealsProps {
  date: Date;
  refreshKey: number;
  onMealDeleted: () => void;
}

interface Meal {
  id: string;
  mealType: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  note?: string;
  entries: Array<{
    id: string;
    foodName: string;
    amount: number;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>;
}

const mealTypeOrder = ['Kahvaltı', 'Öğle', 'Akşam', 'Atıştırmalık'];

export default function DailyMeals({ date, refreshKey, onMealDeleted }: DailyMealsProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, [date, refreshKey]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/calories/meals?date=${dateStr}`);
      const data = await res.json();
      
      // Öğün tipine göre sırala
      const sorted = data.sort((a: Meal, b: Meal) => {
        return mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType);
      });
      
      setMeals(sorted);
    } catch (error) {
      console.error('Meals fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    if (!confirm('Bu öğünü silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/calories/meals/${mealId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onMealDeleted();
      }
    } catch (error) {
      console.error('Meal delete error:', error);
    }
  };

  const toggleExpand = (mealId: string) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse h-20" />
      ))}
    </div>;
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Bu gün için henüz öğün eklenmemiş</p>
        <p className="text-sm mt-2">Yukarıdaki "Öğün Ekle" butonunu kullanarak başlayın</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal) => {
        const isExpanded = expandedMeals.has(meal.id);
        
        return (
          <div key={meal.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{meal.mealType}</h4>
                    <span className="text-sm text-gray-600">
                      {Math.round(meal.totalCalories)} kcal
                    </span>
                  </div>
                  {meal.note && (
                    <p className="text-sm text-gray-600 mt-1">{meal.note}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(meal.id)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Makro özeti */}
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-blue-600">P: {Math.round(meal.totalProtein)}g</span>
                <span className="text-orange-600">K: {Math.round(meal.totalCarbs)}g</span>
                <span className="text-purple-600">Y: {Math.round(meal.totalFat)}g</span>
              </div>
            </div>

            {/* Detaylar */}
            {isExpanded && (
              <div className="p-4 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="pb-2">Yemek</th>
                      <th className="pb-2 text-right">Miktar</th>
                      <th className="pb-2 text-right">Kalori</th>
                      <th className="pb-2 text-right">P</th>
                      <th className="pb-2 text-right">K</th>
                      <th className="pb-2 text-right">Y</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.entries.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="py-2">{entry.foodName}</td>
                        <td className="py-2 text-right">{entry.amount}g</td>
                        <td className="py-2 text-right">{Math.round(entry.calories)}</td>
                        <td className="py-2 text-right text-blue-600">
                          {entry.protein ? Math.round(entry.protein) : '-'}
                        </td>
                        <td className="py-2 text-right text-orange-600">
                          {entry.carbs ? Math.round(entry.carbs) : '-'}
                        </td>
                        <td className="py-2 text-right text-purple-600">
                          {entry.fat ? Math.round(entry.fat) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
