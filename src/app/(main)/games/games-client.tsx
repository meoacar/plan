'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import GameCard from '@/components/games/GameCard';
import GameLeaderboard from '@/components/games/GameLeaderboard';
import CoinBalance from '@/components/coins/CoinBalance';
import { Card } from '@/components/ui/card';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Target,
  Zap,
  TrendingUp,
  Award,
  Clock,
  Coins,
} from 'lucide-react';

interface GamesClientProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    coins: number;
    xp: number;
    level: number;
  };
  games: any[];
  dailyPlays: Record<string, number>;
  highScores: Record<string, number>;
}

export function GamesClient({
  user,
  games,
  dailyPlays,
  highScores,
}: GamesClientProps) {
  const [activeTab, setActiveTab] = useState('all-games');
  const [selectedGame, setSelectedGame] = useState<string | null>(
    games.length > 0 ? games[0].code : null
  );

  // İstatistikler
  const totalPlaysToday = Object.values(dailyPlays).reduce((sum, count) => sum + count, 0);
  const totalHighScore = Object.values(highScores).reduce((sum, score) => sum + score, 0);
  const gamesPlayedToday = Object.keys(dailyPlays).length;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Başlık ve Coin Bakiyesi */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            Mini Oyunlar
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Eğlenceli oyunlar oyna, coin kazan ve liderlik tablosunda yüksel!
          </p>
        </div>

        <CoinBalance coins={user.coins} showAnimation={true} size="lg" />
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Gamepad2}
          label="Toplam Oyun"
          value={games.length}
          color="purple"
        />
        <StatCard
          icon={Target}
          label="Bugün Oynanan"
          value={totalPlaysToday}
          color="blue"
        />
        <StatCard
          icon={Trophy}
          label="Farklı Oyun"
          value={gamesPlayedToday}
          color="green"
        />
        <StatCard
          icon={Award}
          label="Toplam Skor"
          value={totalHighScore}
          color="orange"
        />
      </div>

      {/* Ana İçerik */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all-games" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tüm Oyunlar</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Liderlik</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">İstatistikler</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Tüm Oyunlar Sekmesi */}
            <TabsContent value="all-games" className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Oyunlar
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Her oyun için günde <span className="font-semibold text-purple-600">5 hak</span>
                  </div>
                </div>

                {games.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <GameCard
                          game={game}
                          dailyPlays={dailyPlays[game.id] || 0}
                          highScore={highScores[game.id]}
                        />
                      </motion.div>
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

              {/* Nasıl Oynanır */}
              {games.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Nasıl Oynanır?
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            1
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">
                              Oyun Seç
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Oynamak istediğin oyunu seç ve "Oyna" butonuna tıkla
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                            2
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">
                              Yüksek Skor Yap
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Oyunu oyna ve mümkün olan en yüksek skoru almaya çalış
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                            3
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">
                              Coin Kazan
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Skoruna göre coin kazan ve mağazadan ödül al
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Liderlik Sekmesi */}
            <TabsContent value="leaderboard" className="space-y-6">
              {games.length > 0 ? (
                <>
                  {/* Oyun Seçici */}
                  <div className="flex flex-wrap gap-2">
                    {games.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedGame(game.code)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedGame === game.code
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {game.name}
                      </button>
                    ))}
                  </div>

                  {/* Liderlik Tabloları */}
                  {selectedGame && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Günlük Liderlik
                        </h3>
                        <GameLeaderboard
                          gameCode={selectedGame}
                          period="daily"
                          limit={10}
                          showUserRank={true}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Haftalık Liderlik
                        </h3>
                        <GameLeaderboard
                          gameCode={selectedGame}
                          period="weekly"
                          limit={10}
                          showUserRank={true}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          Tüm Zamanlar
                        </h3>
                        <GameLeaderboard
                          gameCode={selectedGame}
                          period="all-time"
                          limit={50}
                          showUserRank={true}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Henüz liderlik tablosu yok
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Oyunlar eklendikçe liderlik tablosu burada görünecek
                  </p>
                </div>
              )}
            </TabsContent>

            {/* İstatistikler Sekmesi */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Genel İstatistikler */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Genel İstatistikler
                  </h3>
                  <div className="space-y-4">
                    <StatRow
                      label="Toplam Oyun Sayısı"
                      value={games.length}
                      icon={Gamepad2}
                    />
                    <StatRow
                      label="Bugün Oynanan"
                      value={totalPlaysToday}
                      icon={Clock}
                    />
                    <StatRow
                      label="Farklı Oyun Oynandı"
                      value={gamesPlayedToday}
                      icon={Trophy}
                    />
                    <StatRow
                      label="Toplam Yüksek Skor"
                      value={totalHighScore}
                      icon={Award}
                    />
                  </div>
                </Card>

                {/* Oyun Bazlı İstatistikler */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-green-600" />
                    Oyun Performansı
                  </h3>
                  <div className="space-y-4">
                    {games.length > 0 ? (
                      games.map((game) => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {game.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Bugün: {dailyPlays[game.id] || 0} / {game.dailyLimit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {highScores[game.id] || 0}
                            </p>
                            <p className="text-xs text-gray-500">En Yüksek</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                        Henüz oyun yok
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Ödül Bilgisi */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-green-600" />
                    Coin Kazanma Rehberi
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">🥉 Bronz</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Temel performans ile 25-50 coin kazanabilirsin
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-400 mb-2">🥈 Gümüş</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        İyi performans ile 50-100 coin kazanabilirsin
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500 mb-2">🥇 Altın</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mükemmel performans ile 100-200 coin kazanabilirsin
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
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
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </Card>
  );
}

/**
 * İstatistik Satırı
 */
function StatRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
