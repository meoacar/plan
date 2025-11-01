'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface StatsClientProps {
  groupId: string;
  initialDays: number;
}

export function StatsClient({ groupId, initialDays }: StatsClientProps) {
  const [days, setDays] = useState(initialDays);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDaysChange = (value: string) => {
    const newDays = parseInt(value, 10);
    setDays(newDays);
    // Sayfayı yeni days parametresi ile yenile
    window.location.href = `?days=${newDays}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/stats/calculate`, {
        method: 'POST',
      });

      if (response.ok) {
        // Sayfayı yenile
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'İstatistikler güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('İstatistik güncelleme hatası:', error);
      alert('İstatistikler güncellenirken bir hata oluştu');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <label htmlFor="days-select" className="text-sm font-medium text-gray-700">
          Zaman Aralığı:
        </label>
        <select
          id="days-select"
          value={days.toString()}
          onChange={(e) => handleDaysChange(e.target.value)}
          className="w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="7">Son 7 Gün</option>
          <option value="14">Son 14 Gün</option>
          <option value="30">Son 30 Gün</option>
          <option value="60">Son 60 Gün</option>
          <option value="90">Son 90 Gün</option>
        </select>
      </div>

      <Button
        onClick={handleRefresh}
        disabled={isRefreshing}
        variant="outline"
      >
        {isRefreshing ? 'Güncelleniyor...' : 'İstatistikleri Yenile'}
      </Button>
    </div>
  );
}
