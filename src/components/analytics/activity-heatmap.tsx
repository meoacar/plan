'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapData {
  day: string;
  hour: number;
  count: number;
}

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap() {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/heatmap')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />;
  }

  const maxCount = Math.max(...data.map(d => d.count));

  const getColor = (count: number) => {
    if (count === 0) return '#f1f5f9';
    const intensity = (count / maxCount) * 100;
    if (intensity < 25) return '#dcfce7';
    if (intensity < 50) return '#86efac';
    if (intensity < 75) return '#4ade80';
    return '#22c55e';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔥 Aktivite Haritası</CardTitle>
        <CardDescription>Hangi gün ve saatlerde daha aktif?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-1 mb-2">
              <div className="w-12" />
              {HOURS.map(hour => (
                <div key={hour} className="w-8 text-xs text-center text-gray-500">
                  {hour}
                </div>
              ))}
            </div>
            
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex gap-1 mb-1">
                <div className="w-12 text-sm font-medium flex items-center">
                  {day}
                </div>
                {HOURS.map(hour => {
                  const cell = data.find(d => d.day === day && d.hour === hour);
                  const count = cell?.count || 0;
                  
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="w-8 h-8 rounded transition-all hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: getColor(count) }}
                      title={`${day} ${hour}:00 - ${count} plan`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <span>Az</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f1f5f9' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#86efac' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4ade80' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
          </div>
          <span>Çok</span>
        </div>
      </CardContent>
    </Card>
  );
}
