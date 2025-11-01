import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Award,
  Calendar,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

interface WeeklyReportProps {
  goalId: string;
}

export async function WeeklyReport({ goalId }: WeeklyReportProps) {
  // Hedef ve ilerleme verilerini getir
  const goal = await prisma.groupWeeklyGoal.findUnique({
    where: { id: goalId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      progress: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          value: 'desc',
        },
      },
      group: {
        select: {
          name: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
    },
  });

  if (!goal) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Hedef bulunamadı</p>
      </div>
    );
  }

  const totalMembers = goal.group._count.members;
  const participantCount = goal.progress.length;
  const participationRate = totalMembers > 0
    ? (participantCount / totalMembers) * 100
    : 0;

  const progressPercentage = goal.targetValue > 0
    ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    : 0;

  const averageContribution = participantCount > 0
    ? goal.currentValue / participantCount
    : 0;

  const topContributors = goal.progress.slice(0, 3);

  const targetTypeLabels: Record<string, string> = {
    weight_loss: 'Kilo Kaybı',
    activity: 'Aktivite',
    posts: 'Paylaşım',
    exercise: 'Egzersiz',
    water: 'Su Tüketimi',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{goal.title}</h2>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Calendar className="w-4 h-4" />
              <span>
                {format(goal.weekStart, 'd MMM', { locale: tr })} -{' '}
                {format(goal.weekEnd, 'd MMM yyyy', { locale: tr })}
              </span>
            </div>
          </div>
          {goal.completed ? (
            <CheckCircle2 className="w-12 h-12" />
          ) : (
            <XCircle className="w-12 h-12 opacity-50" />
          )}
        </div>
        <p className="text-lg">
          {goal.completed
            ? '🎉 Hedef başarıyla tamamlandı!'
            : '⏰ Hedef tamamlanamadı'}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">İlerleme</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {goal.currentValue.toFixed(1)} / {goal.targetValue}{' '}
            {targetTypeLabels[goal.targetType]}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Katılım</p>
              <p className="text-2xl font-bold text-gray-900">
                {participationRate.toFixed(0)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {participantCount} / {totalMembers} üye
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ortalama Katkı</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageContribution.toFixed(1)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Kişi başı</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Katılımcı</p>
              <p className="text-2xl font-bold text-gray-900">
                {participantCount}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Toplam</p>
        </div>
      </div>

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            En Çok Katkı Sağlayanlar
          </h3>
          <div className="space-y-3">
            {topContributors.map((contributor: any, index: number) => (
              <div
                key={contributor.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {contributor.user.image ? (
                      <Image
                        src={contributor.user.image}
                        alt={contributor.user.name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {contributor.user.name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                        🏆
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {contributor.user.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {index === 0 && '1. '}
                      {index === 1 && '2. '}
                      {index === 2 && '3. '}
                      Sıra
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {contributor.value.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {goal.targetValue > 0
                      ? `${((contributor.value / goal.targetValue) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Participants */}
      {goal.progress.length > 3 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tüm Katılımcılar ({goal.progress.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {goal.progress.map((participant: any) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  {participant.user.image ? (
                    <Image
                      src={participant.user.image}
                      alt={participant.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm">
                        {participant.user.name?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-900">
                    {participant.user.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {participant.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
