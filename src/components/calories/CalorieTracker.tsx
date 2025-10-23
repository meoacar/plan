'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import CalorieGoalCard from './CalorieGoalCard';
import DailyMeals from './DailyMeals';
import AddMealModal from './AddMealModal';
import CalorieStats from './CalorieStats';

interface CalorieTrackerProps {
  userId: string;
}

export default function CalorieTracker({ userId }: CalorieTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMealAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddMeal(false);
  };

  return (
    <div className="space-y-6">
      {/* Tarih Seçici */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← Önceki Gün
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
          </h2>
          <p className="text-sm text-gray-500">
            {format(selectedDate, 'EEEE', { locale: tr })}
          </p>
        </div>

        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
          disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
        >
          Sonraki Gün →
        </button>
      </div>

      {/* Kalori Hedefi */}
      <CalorieGoalCard />

      {/* Günlük İstatistikler */}
      <CalorieStats date={selectedDate} refreshKey={refreshKey} />

      {/* Öğünler */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Günlük Öğünler</h3>
          <button
            onClick={() => setShowAddMeal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Öğün Ekle
          </button>
        </div>

        <DailyMeals 
          date={selectedDate} 
          refreshKey={refreshKey}
          onMealDeleted={() => setRefreshKey(prev => prev + 1)}
        />
      </div>

      {/* Öğün Ekleme Modal */}
      {showAddMeal && (
        <AddMealModal
          date={selectedDate}
          onClose={() => setShowAddMeal(false)}
          onMealAdded={handleMealAdded}
        />
      )}
    </div>
  );
}
