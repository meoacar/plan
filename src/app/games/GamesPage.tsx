'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Trophy, Gamepad2, TrendingUp } from 'lucide-react';
import GameCard from '@/components/games/GameCard';
import GameLeaderboard from '@/components/games/GameLeaderboard';

/**
 * GamesPage - Mini Oyunlar Ana Sayfası
 * 
 * Tüm mini oyunları listeler, günlük limit durumunu gösterir
 * ve liderlik tablosunu içerir.
 */

interface Game {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string | null;
  settings?: any;
  rewardTiers?: any;
  dailyLimit: number;
  playedToday: number;
  remainingPlays: number;
  canPlay: boolean;
  highScore: number;
  totalGames: number;
  averageScore: number;
}

interface GamesData {
  games: Game[];
  dailyLimit: number;
}

export default function GamesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GamesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('CALORIE_GUESS');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/games');

      if (!response.ok) {
        throw new Error('Oyunlar yüklenemedi');
      }

      const result = await response.json();
      setData(result.data);
      
      // İlk oyunu seç
      if (result.data.games.length > 0) {
        setSelectedGame(result.data.games[0].code);
      }
    } catch (err) {
      console.error('Oyunları yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Spinner className="w-12 h-12" />
          <p className="text-gray-600 dark:text-gray-400">Oyunlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Hata</p>
          <p className="text-gray-600 dark:text-gray-400">{error || 'Oyunlar yüklenemedi'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gamepad2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold">Mini Oyunlar</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Eğlenceli oyunlar oynayarak coin kazanın ve bilginizi test edin!
        </p>
      </div>

      {/* Bilgi kartı */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Nasıl Çalışır?</h3>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Her oyunu günde {data.dailyLimit} kez oynayabilirsiniz</li>
              <li>• Performansınıza göre coin kazanırsınız</li>
              <li>• Yüksek skorlar liderlik tablosunda görünür</li>
              <li>• Kazandığınız coinleri mağazada harcayabilirsiniz</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Ana içerik - Tabs */}
      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Oyunlar
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Liderlik Tablosu
          </TabsTrigger>
        </TabsList>

        {/* Oyunlar sekmesi */}
        <TabsContent value="games" className="space-y-6">
          {/* Oyun kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                dailyPlays={game.playedToday}
                highScore={game.highScore}
              />
            ))}
          </div>

          {/* Alt bilgi */}
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-bold mb-1">İpucu</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Oyunları düzenli oynayarak hem eğlenin hem de sağlıklı beslenme konusunda bilginizi artırın.
                  Kazandığınız coinlerle mağazadan özel ödüller satın alabilirsiniz!
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Liderlik tablosu sekmesi */}
        <TabsContent value="leaderboard" className="space-y-6">
          {/* Oyun seçici */}
          <Card className="p-4">
            <label className="block text-sm font-medium mb-2">Oyun Seçin</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {data.games.map((game) => (
                <option key={game.code} value={game.code}>
                  {game.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Liderlik tabloları - 3 periyot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GameLeaderboard
              gameCode={selectedGame}
              period="daily"
              limit={10}
              showUserRank={true}
            />
            
            <GameLeaderboard
              gameCode={selectedGame}
              period="weekly"
              limit={10}
              showUserRank={true}
            />
            
            <GameLeaderboard
              gameCode={selectedGame}
              period="all-time"
              limit={10}
              showUserRank={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
