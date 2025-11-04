'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Target, 
  Trophy, 
  Coins, 
  Clock, 
  ArrowRight,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * GameCard Bileşeni
 * 
 * Mini oyunları gösteren kart bileşeni.
 * Oyun bilgileri, günlük limit durumu, yüksek skor ve oynama butonu içerir.
 */

export interface GameCardProps {
  game: {
    id: string;
    code: string;
    name: string;
    description: string;
    icon?: string | null;
    settings?: any;
    rewardTiers?: any;
    dailyLimit: number;
  };
  dailyPlays: number;
  highScore?: number;
  onPlay?: () => void;
  path?: string;
}

// Oyun ikonları
const GAME_ICONS: Record<string, any> = {
  CALORIE_GUESS: Target,
  MEMORY_CARDS: Brain,
  NUTRITION_QUIZ: Zap,
  DAILY_PUZZLE: Trophy,
};

// Oyun renkleri
const GAME_COLORS: Record<string, string> = {
  CALORIE_GUESS: 'from-blue-500 to-cyan-600',
  MEMORY_CARDS: 'from-purple-500 to-pink-600',
  NUTRITION_QUIZ: 'from-orange-500 to-red-600',
  DAILY_PUZZLE: 'from-green-500 to-emerald-600',
};

// Oyun yolları
const GAME_PATHS: Record<string, string> = {
  CALORIE_GUESS: '/games/calorie-guess',
  MEMORY_CARDS: '/games/memory-cards',
  NUTRITION_QUIZ: '/games/nutrition-quiz',
  DAILY_PUZZLE: '/games/daily-puzzle',
};

export default function GameCard({
  game,
  dailyPlays,
  highScore = 0,
  onPlay,
  path,
}: GameCardProps) {
  const router = useRouter();
  
  const Icon = GAME_ICONS[game.code] || Target;
  const colorClass = GAME_COLORS[game.code] || 'from-gray-500 to-gray-600';
  const gamePath = path || GAME_PATHS[game.code] || `/games/${game.code.toLowerCase()}`;
  
  const remainingPlays = Math.max(0, game.dailyLimit - dailyPlays);
  const canPlay = remainingPlays > 0;
  
  // Maksimum coin ödülünü hesapla
  const maxCoins = game.rewardTiers?.gold?.coins || 
                   game.rewardTiers?.silver?.coins || 
                   game.rewardTiers?.bronze?.coins || 
                   100;

  // Oyun süresini hesapla
  const duration = game.settings?.duration 
    ? `${game.settings.duration} saniye`
    : game.settings?.questionCount 
    ? `${game.settings.questionCount} soru`
    : '5-10 dakika';

  const handlePlay = () => {
    if (!canPlay) return;
    
    if (onPlay) {
      onPlay();
    } else {
      router.push(gamePath);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Oyun başlığı - gradient arka plan */}
      <div className={`h-32 bg-gradient-to-br ${colorClass} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <Icon className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
        
        {/* Günlük limit badge */}
        {!canPlay && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              <Lock className="w-3 h-3 mr-1" />
              Limit Doldu
            </Badge>
          </div>
        )}
        
        {highScore > 0 && canPlay && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              <Trophy className="w-3 h-3 mr-1" />
              {highScore}
            </Badge>
          </div>
        )}
      </div>

      {/* Oyun bilgileri */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {game.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {game.description}
        </p>

        {/* Oyun detayları */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Süre
            </span>
            <span className="font-medium">{duration}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Coins className="w-4 h-4" />
              Maks. Ödül
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {maxCoins} coin
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Target className="w-4 h-4" />
              Günlük Limit
            </span>
            <span className={`font-medium ${!canPlay ? 'text-red-600' : 'text-green-600'}`}>
              {remainingPlays} / {game.dailyLimit}
            </span>
          </div>

          {highScore > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                En Yüksek Skor
              </span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">
                {highScore}
              </span>
            </div>
          )}
        </div>

        {/* Oyna butonu */}
        <Button
          onClick={handlePlay}
          disabled={!canPlay}
          className="w-full group-hover:shadow-lg transition-shadow"
          size="lg"
        >
          {canPlay ? (
            <>
              Oyna
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Günlük Limit Doldu
            </>
          )}
        </Button>

        {/* Bugün oynandı göstergesi */}
        {dailyPlays > 0 && canPlay && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <CheckCircle className="w-3 h-3" />
            <span>Bugün {dailyPlays} kez oynadınız</span>
          </div>
        )}
      </div>
    </Card>
  );
}
