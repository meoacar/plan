'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, TrendingDown, Zap, Heart, Droplet, Dumbbell, Apple } from 'lucide-react';

interface Partner {
  id: string;
  name: string | null;
}

interface CheckIn {
  id: string;
  weight: number | null;
  energy: number | null;
  motivation: number | null;
  sleep: number | null;
  water: number | null;
  exercise: boolean;
  dietPlan: boolean;
  note: string | null;
  createdAt: Date;
}

interface Props {
  partnershipId: string;
  partner: Partner;
  checkIns: CheckIn[];
}

export default function PartnerCheckIns({ partnershipId, partner, checkIns }: Props) {
  const renderStars = (value: number | null) => {
    if (!value) return '-';
    return '⭐'.repeat(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {partner.name}'in Check-in Geçmişi
        </h3>
        <p className="text-sm text-gray-600">
          Son {checkIns.length} check-in
        </p>
      </div>

      {checkIns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Henüz check-in yok
        </div>
      ) : (
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <div key={checkIn.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold">
                    {format(new Date(checkIn.createdAt), 'dd MMMM yyyy', { locale: tr })}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(checkIn.createdAt), 'HH:mm', { locale: tr })}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {checkIn.weight && (
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Kilo</p>
                      <p className="font-semibold">{checkIn.weight}kg</p>
                    </div>
                  </div>
                )}

                {checkIn.energy && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-xs text-gray-600">Enerji</p>
                      <p className="font-semibold">{renderStars(checkIn.energy)}</p>
                    </div>
                  </div>
                )}

                {checkIn.motivation && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-600">Motivasyon</p>
                      <p className="font-semibold">{renderStars(checkIn.motivation)}</p>
                    </div>
                  </div>
                )}

                {checkIn.water && (
                  <div className="flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-600">Su</p>
                      <p className="font-semibold">{checkIn.water} bardak</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mb-4">
                {checkIn.exercise && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    <Dumbbell className="w-4 h-4" />
                    Spor Yaptı
                  </div>
                )}
                {checkIn.dietPlan && (
                  <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                    <Apple className="w-4 h-4" />
                    Diyet Planına Uydu
                  </div>
                )}
              </div>

              {checkIn.note && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 italic">"{checkIn.note}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
