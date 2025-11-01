'use client';

import Image from 'next/image';
import { Award } from 'lucide-react';

interface Participant {
  id: string;
  value: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface GoalParticipantsProps {
  participants: Participant[];
  targetValue: number;
  targetType: string;
}

export function GoalParticipants({
  participants,
  targetValue,
  targetType,
}: GoalParticipantsProps) {
  if (participants.length === 0) {
    return null;
  }

  const topThree = participants.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Award className="w-4 h-4 text-yellow-500" />
        <span>En Çok Katkı Sağlayanlar</span>
      </div>

      <div className="space-y-2">
        {topThree.map((participant, index) => {
          const percentage = targetValue > 0
            ? (participant.value / targetValue) * 100
            : 0;

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {participant.user.image ? (
                    <Image
                      src={participant.user.image}
                      alt={participant.user.name || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {participant.user.name?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                      🏆
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                      🥈
                    </div>
                  )}
                  {index === 2 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-300 rounded-full flex items-center justify-center text-xs">
                      🥉
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {participant.user.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {percentage.toFixed(1)}% katkı
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {participant.value.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">
                  {targetType === 'weight_loss' && 'kg'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {participants.length > 3 && (
        <p className="text-xs text-gray-500 text-center pt-2">
          +{participants.length - 3} kişi daha katıldı
        </p>
      )}
    </div>
  );
}
