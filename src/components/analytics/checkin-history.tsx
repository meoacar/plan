"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface CheckIn {
  id: string;
  weight?: number;
  energy?: number;
  motivation?: number;
  sleep?: number;
  water?: number;
  exercise: boolean;
  dietPlan: boolean;
  note?: string;
  createdAt: string;
}

export default function CheckInHistory() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const fetchCheckIns = async () => {
    try {
      const res = await fetch(`/api/analytics/checkin?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setCheckIns(data);
      }
    } catch (error) {
      console.error("Failed to fetch check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </Card>
    );
  }

  if (checkIns.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Check-In Geçmişi</h3>
        <p className="text-gray-500 text-center py-12">
          Henüz check-in kaydı yok. Yukarıdaki formdan ilk check-in&apos;inizi yapın!
        </p>
      </Card>
    );
  }

  // İstatistikler
  const totalCheckIns = checkIns.length;
  const exerciseDays = checkIns.filter(c => c.exercise).length;
  const dietDays = checkIns.filter(c => c.dietPlan).length;
  const avgEnergy = checkIns.filter(c => c.energy).length > 0
    ? (checkIns.reduce((sum, c) => sum + (c.energy || 0), 0) / checkIns.filter(c => c.energy).length).toFixed(1)
    : "0";
  const avgMotivation = checkIns.filter(c => c.motivation).length > 0
    ? (checkIns.reduce((sum, c) => sum + (c.motivation || 0), 0) / checkIns.filter(c => c.motivation).length).toFixed(1)
    : "0";
  const avgSleep = checkIns.filter(c => c.sleep).length > 0
    ? (checkIns.reduce((sum, c) => sum + (c.sleep || 0), 0) / checkIns.filter(c => c.sleep).length).toFixed(1)
    : "0";
  const avgWater = checkIns.filter(c => c.water).length > 0
    ? Math.round(checkIns.reduce((sum, c) => sum + (c.water || 0), 0) / checkIns.filter(c => c.water).length)
    : 0;

  // Grafik verisi
  const chartData = checkIns.slice().reverse().map((c) => ({
    tarih: format(new Date(c.createdAt), "dd MMM", { locale: tr }),
    Enerji: c.energy || 0,
    Motivasyon: c.motivation || 0,
    Uyku: c.sleep || 0,
  }));

  const habitData = checkIns.slice().reverse().map((c) => ({
    tarih: format(new Date(c.createdAt), "dd MMM", { locale: tr }),
    Egzersiz: c.exercise ? 1 : 0,
    Diyet: c.dietPlan ? 1 : 0,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Check-In İstatistikleri</h3>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value={7}>Son 7 gün</option>
            <option value={30}>Son 30 gün</option>
            <option value={90}>Son 90 gün</option>
          </select>
        </div>

        {/* Özet Kartlar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Toplam Check-In</p>
            <p className="text-2xl font-bold text-blue-600">{totalCheckIns}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Egzersiz Günü</p>
            <p className="text-2xl font-bold text-green-600">{exerciseDays}</p>
            <p className="text-xs text-gray-500">%{Math.round((exerciseDays / totalCheckIns) * 100)}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Diyet Uyum</p>
            <p className="text-2xl font-bold text-purple-600">{dietDays}</p>
            <p className="text-xs text-gray-500">%{Math.round((dietDays / totalCheckIns) * 100)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Ort. Uyku</p>
            <p className="text-2xl font-bold text-orange-600">{avgSleep}sa</p>
          </div>
        </div>

        {/* Ortalamalar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Ortalama Enerji</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(parseFloat(avgEnergy) / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{avgEnergy}/5</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Ortalama Motivasyon</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(parseFloat(avgMotivation) / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{avgMotivation}/5</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Ortalama Su</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">💧</span>
              <span className="text-sm font-semibold">{avgWater} bardak</span>
            </div>
          </div>
        </div>

        {/* Enerji & Motivasyon Grafiği */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Enerji & Motivasyon Trendi</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tarih" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Enerji" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="Motivasyon" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alışkanlık Grafiği */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Egzersiz & Diyet Uyumu</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={habitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tarih" />
              <YAxis domain={[0, 1]} ticks={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Egzersiz" fill="#10b981" />
              <Bar dataKey="Diyet" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Son Check-In'ler */}
        <div>
          <h4 className="font-semibold mb-3">Son Check-In&apos;ler</h4>
          <div className="space-y-3">
            {checkIns.slice(0, 5).map((checkIn) => (
              <div key={checkIn.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium">
                    {format(new Date(checkIn.createdAt), "dd MMMM yyyy, HH:mm", { locale: tr })}
                  </p>
                  {checkIn.weight && (
                    <span className="text-sm font-semibold text-green-600">
                      {checkIn.weight} kg
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                  {checkIn.energy && (
                    <div>
                      <span className="text-gray-600">Enerji:</span>
                      <span className="ml-1 font-semibold">{checkIn.energy}/5</span>
                    </div>
                  )}
                  {checkIn.motivation && (
                    <div>
                      <span className="text-gray-600">Motivasyon:</span>
                      <span className="ml-1 font-semibold">{checkIn.motivation}/5</span>
                    </div>
                  )}
                  {checkIn.sleep && (
                    <div>
                      <span className="text-gray-600">Uyku:</span>
                      <span className="ml-1 font-semibold">{checkIn.sleep}sa</span>
                    </div>
                  )}
                  {checkIn.water && (
                    <div>
                      <span className="text-gray-600">Su:</span>
                      <span className="ml-1 font-semibold">{checkIn.water} bardak</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-2">
                  {checkIn.exercise && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      ✓ Egzersiz
                    </span>
                  )}
                  {checkIn.dietPlan && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      ✓ Diyet
                    </span>
                  )}
                </div>

                {checkIn.note && (
                  <p className="text-sm text-gray-700 italic">&quot;{checkIn.note}&quot;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
