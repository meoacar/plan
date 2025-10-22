'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CityData {
  city: string;
  userCount: number;
  avgWeightLoss: number;
  totalWeightLoss: number;
}

export function TurkeyWeightMap() {
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/weight-map')
      .then(res => res.json())
      .then(data => {
        setCityData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />;
  }

  const maxWeightLoss = Math.max(...cityData.map(c => c.totalWeightLoss));

  return (
    <Card>
      <CardHeader>
        <CardTitle>🗺️ Türkiye Kilo Haritası</CardTitle>
        <CardDescription>Şehirlere göre toplam kilo kaybı</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cityData.map((city) => {
            const intensity = (city.totalWeightLoss / maxWeightLoss) * 100;
            const bgColor = `rgba(34, 197, 94, ${intensity / 100})`;
            
            return (
              <div
                key={city.city}
                className="p-4 rounded-lg border transition-all hover:scale-105"
                style={{ backgroundColor: bgColor }}
              >
                <div className="font-semibold text-lg">{city.city}</div>
                <div className="text-sm text-gray-600">
                  {city.userCount} kullanıcı
                </div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {city.totalWeightLoss.toFixed(1)} kg
                </div>
                <div className="text-xs text-gray-500">
                  Ort: {city.avgWeightLoss.toFixed(1)} kg/kişi
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
