'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Partner {
  id: string;
  name: string | null;
  startWeight: number | null;
  goalWeight: number | null;
}

interface WeightLog {
  id: string;
  weight: number;
  createdAt: Date;
}

interface Props {
  currentUser: Partner;
  partner: Partner;
  currentUserWeightLogs: WeightLog[];
  partnerWeightLogs: WeightLog[];
}

export default function PartnershipStats({
  currentUser,
  partner,
  currentUserWeightLogs,
  partnerWeightLogs,
}: Props) {
  // Grafik verilerini hazırla
  const chartData: Array<{
    date: string;
    [key: string]: string | number | undefined;
  }> = [];
  const allDates = new Set([
    ...currentUserWeightLogs.map((log) => format(new Date(log.createdAt), 'yyyy-MM-dd')),
    ...partnerWeightLogs.map((log) => format(new Date(log.createdAt), 'yyyy-MM-dd')),
  ]);

  const sortedDates = Array.from(allDates).sort();

  sortedDates.forEach((date) => {
    const currentUserLog = currentUserWeightLogs.find(
      (log) => format(new Date(log.createdAt), 'yyyy-MM-dd') === date
    );
    const partnerLog = partnerWeightLogs.find(
      (log) => format(new Date(log.createdAt), 'yyyy-MM-dd') === date
    );

    chartData.push({
      date,
      [currentUser.name || 'Sen']: currentUserLog?.weight,
      [partner.name || 'Partner']: partnerLog?.weight,
    });
  });

  const currentWeight = currentUserWeightLogs[currentUserWeightLogs.length - 1]?.weight;
  const partnerWeight = partnerWeightLogs[partnerWeightLogs.length - 1]?.weight;

  const currentProgress = currentUser.startWeight && currentUser.goalWeight && currentWeight
    ? ((currentUser.startWeight - currentWeight) / (currentUser.startWeight - currentUser.goalWeight)) * 100
    : 0;

  const partnerProgress = partner.startWeight && partner.goalWeight && partnerWeight
    ? ((partner.startWeight - partnerWeight) / (partner.startWeight - partner.goalWeight)) * 100
    : 0;

  return (
    <div className="space-y-8">
      {/* İlerleme Karşılaştırması */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">{currentUser.name || 'Sen'}</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Başlangıç:</span>
              <span className="font-semibold">{currentUser.startWeight}kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Şu an:</span>
              <span className="font-semibold">{currentWeight?.toFixed(1) || '-'}kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hedef:</span>
              <span className="font-semibold">{currentUser.goalWeight}kg</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">İlerleme</span>
                <span className="font-semibold">{currentProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(currentProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">{partner.name}</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Başlangıç:</span>
              <span className="font-semibold">{partner.startWeight}kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Şu an:</span>
              <span className="font-semibold">{partnerWeight?.toFixed(1) || '-'}kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hedef:</span>
              <span className="font-semibold">{partner.goalWeight}kg</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">İlerleme</span>
                <span className="font-semibold">{partnerProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(partnerProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kilo Grafiği */}
      {chartData.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Kilo Takibi</h3>
          <div className="bg-white rounded-lg border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: tr })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: tr })}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={currentUser.name || 'Sen'}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey={partner.name || 'Partner'}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Motivasyon Mesajı */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
        <p className="text-lg font-medium text-gray-800">
          {currentProgress > partnerProgress
            ? `Harika gidiyorsun! Partnerinden ${(currentProgress - partnerProgress).toFixed(1)}% öndesin! 🎉`
            : currentProgress < partnerProgress
            ? `Partnerini yakalamak için biraz daha çaba! ${(partnerProgress - currentProgress).toFixed(1)}% fark var! 💪`
            : 'Partnerinle eşit ilerliyorsunuz! Birlikte başarıya! 🤝'}
        </p>
      </div>
    </div>
  );
}
