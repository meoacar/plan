'use client';

import { useState, useEffect } from 'react';
import { Target, Edit2, Save, X } from 'lucide-react';

interface CalorieGoal {
  dailyCalories: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  activityLevel: string;
}

const activityLevels = {
  sedentary: 'Hareketsiz (Ofis işi)',
  light: 'Az Hareketli (Haftada 1-3 gün)',
  moderate: 'Orta Hareketli (Haftada 3-5 gün)',
  active: 'Çok Hareketli (Haftada 6-7 gün)',
  very_active: 'Aşırı Hareketli (Günde 2 kez)',
};

export default function CalorieGoalCard() {
  const [goal, setGoal] = useState<CalorieGoal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CalorieGoal>({
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 200,
    dailyFat: 65,
    activityLevel: 'moderate',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const res = await fetch('/api/calories/goal');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setGoal(data);
          setFormData(data);
        }
      }
    } catch (error) {
      console.error('Goal fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/calories/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setGoal(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Goal save error:', error);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6 animate-pulse h-32" />;
  }

  if (!goal && !isEditing) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Günlük Kalori Hedefi
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Henüz bir hedef belirlemediniz
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Hedef Belirle
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Kalori Hedefi Ayarla</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Günlük Kalori Hedefi
            </label>
            <input
              type="number"
              value={formData.dailyCalories}
              onChange={(e) => setFormData({ ...formData, dailyCalories: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="800"
              max="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktivite Seviyesi
            </label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(activityLevels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              value={formData.dailyProtein || ''}
              onChange={(e) => setFormData({ ...formData, dailyProtein: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Opsiyonel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Karbonhidrat (g)
            </label>
            <input
              type="number"
              value={formData.dailyCarbs || ''}
              onChange={(e) => setFormData({ ...formData, dailyCarbs: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Opsiyonel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yağ (g)
            </label>
            <input
              type="number"
              value={formData.dailyFat || ''}
              onChange={(e) => setFormData({ ...formData, dailyFat: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Opsiyonel"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              if (goal) setFormData(goal);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            İptal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Günlük Hedefler
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600">Kalori</p>
          <p className="text-2xl font-bold text-green-600">{goal.dailyCalories}</p>
        </div>
        {goal.dailyProtein && (
          <div>
            <p className="text-sm text-gray-600">Protein</p>
            <p className="text-2xl font-bold text-blue-600">{goal.dailyProtein}g</p>
          </div>
        )}
        {goal.dailyCarbs && (
          <div>
            <p className="text-sm text-gray-600">Karbonhidrat</p>
            <p className="text-2xl font-bold text-orange-600">{goal.dailyCarbs}g</p>
          </div>
        )}
        {goal.dailyFat && (
          <div>
            <p className="text-sm text-gray-600">Yağ</p>
            <p className="text-2xl font-bold text-purple-600">{goal.dailyFat}g</p>
          </div>
        )}
      </div>
    </div>
  );
}
