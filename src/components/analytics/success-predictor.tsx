'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PredictionData {
  successProbability: number;
  factors: {
    name: string;
    score: number;
    weight: number;
    description: string;
  }[];
  recommendations: string[];
}

export function SuccessPredictor({ userId }: { userId: string }) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/success-prediction?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setPrediction(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />;
  }

  if (!prediction) return null;

  const getColorClass = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Başarı Tahmini</CardTitle>
        <CardDescription>Hedefine ulaşma olasılığın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`text-6xl font-bold ${getColorClass(prediction.successProbability)}`}>
            %{prediction.successProbability}
          </div>
          <p className="text-gray-600 mt-2">Başarı Olasılığı</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Faktörler</h3>
          {prediction.factors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{factor.name}</span>
                <span className="text-gray-600">{factor.score}/100</span>
              </div>
              <Progress value={factor.score} className="h-2" />
              <p className="text-xs text-gray-500">{factor.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">💡 Öneriler</h3>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
