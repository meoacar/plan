'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface AddMealModalProps {
  date: Date;
  onClose: () => void;
  onMealAdded: () => void;
}

interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize: number;
}

interface MealEntry {
  foodId?: string;
  foodName: string;
  amount: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

const mealTypes = ['Kahvaltı', 'Öğle', 'Akşam', 'Atıştırmalık'];

export default function AddMealModal({ date, onClose, onMealAdded }: AddMealModalProps) {
  const [mealType, setMealType] = useState('Kahvaltı');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchFoods();
    } else {
      setFoods([]);
    }
  }, [searchQuery]);

  const searchFoods = async () => {
    try {
      const res = await fetch(`/api/calories/foods?search=${encodeURIComponent(searchQuery)}&commonOnly=true`);
      const data = await res.json();
      setFoods(data);
    } catch (error) {
      console.error('Food search error:', error);
    }
  };

  const handleAddEntry = () => {
    if (!selectedFood) return;

    const ratio = amount / selectedFood.servingSize;
    const entry: MealEntry = {
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      amount,
      calories: selectedFood.calories * ratio,
      protein: selectedFood.protein ? selectedFood.protein * ratio : undefined,
      carbs: selectedFood.carbs ? selectedFood.carbs * ratio : undefined,
      fat: selectedFood.fat ? selectedFood.fat * ratio : undefined,
    };

    setEntries([...entries, entry]);
    setSelectedFood(null);
    setSearchQuery('');
    setAmount(100);
  };

  const handleRemoveEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (entries.length === 0) {
      alert('En az bir yemek eklemelisiniz');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/calories/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd'),
          mealType,
          note: note || undefined,
          entries,
        }),
      });

      if (res.ok) {
        onMealAdded();
      } else {
        alert('Öğün eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Meal add error:', error);
      alert('Öğün eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
  const totalCarbs = entries.reduce((sum, e) => sum + (e.carbs || 0), 0);
  const totalFat = entries.reduce((sum, e) => sum + (e.fat || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Öğün Ekle</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Öğün Tipi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öğün Tipi
            </label>
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-4 py-2 rounded-lg border ${
                    mealType === type
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Yemek Arama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yemek Ara
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Yemek adı yazın..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            {/* Arama Sonuçları */}
            {foods.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                {foods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setFoods([]);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-0"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{food.name}</span>
                      <span className="text-sm text-gray-600">{food.calories} kcal/100g</span>
                    </div>
                    <div className="text-xs text-gray-500">{food.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Seçili Yemek */}
          {selectedFood && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{selectedFood.name}</h4>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-1">
                    Miktar (gram)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                  />
                </div>
                <button
                  onClick={handleAddEntry}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </button>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {Math.round((selectedFood.calories * amount) / selectedFood.servingSize)} kcal
                {selectedFood.protein && ` • P: ${Math.round((selectedFood.protein * amount) / selectedFood.servingSize)}g`}
                {selectedFood.carbs && ` • K: ${Math.round((selectedFood.carbs * amount) / selectedFood.servingSize)}g`}
                {selectedFood.fat && ` • Y: ${Math.round((selectedFood.fat * amount) / selectedFood.servingSize)}g`}
              </div>
            </div>
          )}

          {/* Eklenen Yemekler */}
          {entries.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Eklenen Yemekler</h4>
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{entry.foodName}</div>
                      <div className="text-sm text-gray-600">
                        {entry.amount}g • {Math.round(entry.calories)} kcal
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveEntry(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Toplam */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Toplam</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(totalCalories)} kcal
                    </div>
                    <div className="text-sm text-gray-600">
                      P: {Math.round(totalProtein)}g • K: {Math.round(totalCarbs)}g • Y: {Math.round(totalFat)}g
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Not */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Not (Opsiyonel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Öğün hakkında not ekleyin..."
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || entries.length === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Kaydediliyor...' : 'Öğünü Kaydet'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
