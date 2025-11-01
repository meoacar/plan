import { prisma } from '@/lib/prisma';
import { GoalProgress } from './goal-progress';
import { GoalParticipants } from './goal-participants';
import { QuickUpdateButton } from './quick-update-button';
import { Calendar, Target, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface WeeklyGoalProps {
  groupId: string;
  userId: string;
}

export async function WeeklyGoal({ groupId, userId }: WeeklyGoalProps) {
  const now = new Date();

  // Güncel haftalık hedefi getir
  const currentGoal = await prisma.groupWeeklyGoal.findFirst({
    where: {
      groupId,
      weekStart: { lte: now },
      weekEnd: { gte: now },
    },
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
        take: 5,
      },
      _count: {
        select: {
          progress: true,
        },
      },
    },
  });

  if (!currentGoal) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Haftalık Hedef Yok
          </h3>
          <p className="text-gray-600">
            Bu hafta için henüz bir hedef belirlenmedi.
          </p>
        </div>
      </div>
    );
  }

  const progressPercentage = currentGoal.targetValue > 0
    ? Math.min((currentGoal.currentValue / currentGoal.targetValue) * 100, 100)
    : 0;

  const userProgress = currentGoal.progress.find((p: any) => p.userId === userId);

  const targetTypeLabels: Record<string, string> = {
    weight_loss: 'Kilo Kaybı',
    activity: 'Aktivite',
    posts: 'Paylaşım',
    exercise: 'Egzersiz',
    water: 'Su Tüketimi',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">
                Haftalık Hedef
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{currentGoal.title}</h2>
            {currentGoal.description && (
              <p className="text-white/90 text-sm">{currentGoal.description}</p>
            )}
          </div>
          {currentGoal.completed && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              ✓ Tamamlandı
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {format(currentGoal.weekStart, 'd MMM', { locale: tr })} -{' '}
              {format(currentGoal.weekEnd, 'd MMM', { locale: tr })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{currentGoal._count.progress} katılımcı</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {targetTypeLabels[currentGoal.targetType] || currentGoal.targetType}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {currentGoal.currentValue.toFixed(1)} / {currentGoal.targetValue}{' '}
              {currentGoal.targetType === 'weight_loss' && 'kg'}
            </span>
          </div>
          <GoalProgress
            current={currentGoal.currentValue}
            target={currentGoal.targetValue}
            percentage={progressPercentage}
          />
        </div>

        {/* User's contribution */}
        {userProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Senin Katkın</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {userProgress.value.toFixed(1)}{' '}
                {currentGoal.targetType === 'weight_loss' && 'kg'}
              </span>
            </div>
          </div>
        )}

        {/* Quick Update Button */}
        {!currentGoal.completed && (
          <div className="mb-6">
            <QuickUpdateButton
              groupId={groupId}
              goalId={currentGoal.id}
              targetType={currentGoal.targetType}
              currentValue={userProgress?.value}
            />
          </div>
        )}

        {/* Top contributors */}
        {currentGoal.progress.length > 0 && (
          <GoalParticipants
            participants={currentGoal.progress}
            targetValue={currentGoal.targetValue}
            targetType={currentGoal.targetType}
          />
        )}
      </div>
    </div>
  );
}
