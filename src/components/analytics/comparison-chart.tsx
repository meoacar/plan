'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  metric: string;
  you: number;
  average: number;
}

export function ComparisonChart({ userId }: { userId: string }) {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/comparison?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Sen vs Ortalama Kullanıcı</CardTitle>
        <CardDescription>Performansını karşılaştır</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="you" fill="#22c55e" name="Sen" />
            <Bar dataKey="average" fill="#94a3b8" name="Ortalama" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
