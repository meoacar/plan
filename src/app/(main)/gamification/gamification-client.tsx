'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import QuestList from '@/components/quests/QuestList';
import RewardShop from '@/components/shop/RewardShop';
import GameCard from '@/components/games/GameCard';
import GameLeaderboard from '@/components/games/GameLeaderboard';
import CoinBalance from '@/components/coins/CoinBalance';
import { StreakDisplay } from '@/components/streak/StreakDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  Store,
  Gamepad2,
  Trophy,
  Flame,
  Sparkles,
  TrendingUp,
  Coins,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GamificationClientProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    xp: number;
    level: number;
    streak: number;
    coins: number;
  };
  quests: {
    daily: any[];
    weekly: any[];
    special: any[];
  };
  games: any[];
  dailyPlays: Record<string, number>;
  highScores: Record<string, number>;
  streak: {
    current: number;
    nextMilestone: number;
    nextReward: any;
    availableMilestones: any[];
  };
}

export function GamificationClient({
  user,
  quests,
  games,
  dailyPlays,
  highScores,
  streak,
}: GamificationClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('quests');
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [coins, setCoins] = useState(user.coins);

  // Görev ödülü talep et
  const handleClaimReward = async (questId: string) => {
    try {
      setClaimingQuestId(questId);

      const response = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ödül talep edilemedi');
      }

      // Coin bakiyesini güncelle
      setCoins((prev) => prev + data.data.coins);

      // Başarı mesajı
      alert(`Ödül alındı! 🎉\n${data.data.coins} coin ve ${data.data.xp} XP kazandınız!`);

      // Sayfayı yenile
      router.refresh();
    } catch (error) {
      console.error('Ödül talep hatası:', error);
      alert(error instanceof Error ? error.message : 'Ödül talep edilemedi');
    } finally {
      setClaimingQuestId(null);
    }
  };

  // Streak bonusu talep et
  const handleClaimStreakBonus = async (streakDays: number) => {
    try {
      const response = await fetch('/api/streak/claim-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streakDays }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bonus talep edilemedi');
      }

      // Coin bakiyesini güncelle
      setCoins((prev) => prev + data.data.coins);

      // Başarı mesajı
      alert(`Streak bonusu alındı! 🔥\n${data.data.coins} coin ve ${data.data.xp} XP kazandınız!`);

      // Sayfayı yenile
      router.refresh();
    } catch (error) {
      console.error('Bonus talep hatası:', error);
      alert(error instanceof Error ? error.message : 'Bonus talep edilemedi');
    }
  };

  // Tüm görevleri birleştir
  const allQuests = [...quests.daily, ...quests.weekly, ...quests.special];

  // İstatistikler
  const stats = {
    totalQuests: allQuests.length,
    completedQuests: allQuests.filter((q) => q.completed).length,
    totalGames: games.length,
    totalCoins: coins,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Başlık ve Coin Bakiyesi */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              Gamification
            </h1>
            {/* Aktif Görev Badge */}
            {stats.totalQuests - stats.completedQuests > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-sm font-bold shadow-lg"
              >
                <Target className="w-4 h-4" />
                <span>{stats.totalQuests - stats.completedQuests} Aktif</span>
              </motion.div>
            )}
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Görevleri tamamla, oyunlar oyna ve ödüller kazan!
          </p>
        </div>

        <CoinBalance coins={coins} showAnimation={true} size="lg" />
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Aktif Görevler"
          value={stats.totalQuests}
          color="blue"
        />
        <StatCard
          icon={Trophy}
          label="Tamamlanan"
          value={stats.completedQuests}
          color="green"
        />
        <StatCard
          icon={Gamepad2}
          label="Oyunlar"
          value={stats.totalGames}
          color="purple"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={streak.current}
          color="orange"
        />
      </div>

      {/* Streak Gösterimi */}
      {streak.current > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StreakDisplay
            streak={streak.current}
            nextMilestone={streak.nextMilestone}
            nextReward={streak.nextReward}
            availableMilestones={streak.availableMilestones}
            onClaimBonus={handleClaimStreakBonus}
          />
        </motion.div>
      )}

      {/* Ana Sekmeler */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="quests" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Görevler</span>
              </TabsTrigger>
              <TabsTrigger value="shop" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Mağaza</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Oyunlar</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Liderlik</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Görevler Sekmesi */}
            <TabsContent value="quests" className="space-y-8">
              {quests.daily.length > 0 && (
                <QuestList
                  quests={quests.daily}
                  type="daily"
                  onClaimReward={handleClaimReward}
                  claimingQuestId={claimingQuestId}
                />
              )}

              {quests.weekly.length > 0 && (
                <QuestList
                  quests={quests.weekly}
                  type="weekly"
                  onClaimReward={handleClaimReward}
                  claimingQuestId={claimingQuestId}
                />
              )}

              {quests.special.length > 0 && (
                <QuestList
                  quests={quests.special}
                  type="special"
                  onClaimReward={handleClaimReward}
                  claimingQuestId={claimingQuestId}
                />
              )}

              {allQuests.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Henüz görev yok
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yeni görevler yakında eklenecek!
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Mağaza Sekmesi */}
            <TabsContent value="shop">
              <RewardShop initialUserCoins={coins} />
            </TabsContent>

            {/* Oyunlar Sekmesi */}
            <TabsContent value="games" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6" />
                  Mini Oyunlar
                </h2>

                {games.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        dailyPlays={dailyPlays[game.id] || 0}
                        highScore={highScores[game.id]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Henüz oyun yok
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Yeni oyunlar yakında eklenecek!
                    </p>
                  </div>
                )}
              </div>

              {/* Oyun Liderlik Tablosu */}
              {games.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Liderlik Tablosu
                  </h2>
                  <GameLeaderboard
                    gameCode={games[0].code}
                    period="all-time"
                    limit={10}
                    showUserRank={true}
                  />
                </div>
              )}
            </TabsContent>

            {/* Liderlik Sekmesi */}
            <TabsContent value="leaderboard" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  Coin Liderlik Tablosu
                </h2>
                <CoinLeaderboard period="weekly" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  XP Liderlik Tablosu
                </h2>
                <XPLeaderboard period="weekly" />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

/**
 * İstatistik Kartı
 */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </Card>
  );
}

/**
 * Coin Liderlik Tablosu (Placeholder)
 */
function CoinLeaderboard({ period }: { period: string }) {
  return (
    <Card className="p-8 text-center">
      <Coins className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">
        Coin liderlik tablosu yakında eklenecek
      </p>
    </Card>
  );
}

/**
 * XP Liderlik Tablosu (Placeholder)
 */
function XPLeaderboard({ period }: { period: string }) {
  return (
    <Card className="p-8 text-center">
      <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400">
        XP liderlik tablosu yakında eklenecek
      </p>
    </Card>
  );
}
