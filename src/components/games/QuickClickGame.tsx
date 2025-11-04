'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Trophy, Coins, Target, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

/**
 * Hızlı Tıklama Oyunu Bileşeni
 * 
 * 30 saniye süresince rastgele yiyecekler gösterir.
 * Kullanıcı sağlıklı yiyecekleri tıklar, sağlıksız olanlardan kaçınır.
 * Performansa göre coin ödülü verir.
 */

interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  isHealthy: boolean;
}

interface QuickClickGameProps {
  onComplete: (score: number, gameData: any) => void;
  onCancel?: () => void;
}

// Oyun ayarları
const GAME_DURATION = 30; // saniye
const ITEM_DISPLAY_TIME = 2000; // ms - her yiyecek 2 saniye gösterilir
const CORRECT_POINTS = 10;
const WRONG_PENALTY = -5;

// Ödül seviyeleri
const REWARD_TIERS = {
  gold: { minScore: 300, coins: 100, label: 'Altın!' },
  silver: { minScore: 200, coins: 60, label: 'Gümüş!' },
  bronze: { minScore: 100, coins: 30, label: 'Bronz!' },
};

// Sağlıklı kategoriler
const HEALTHY_CATEGORIES = [
  'Sebze',
  'Meyve',
  'Tahıl',
  'Baklagil',
  'Kuruyemiş',
  'Protein',
  'Süt Ürünleri',
];

// Sağlıksız kategoriler
const UNHEALTHY_CATEGORIES = [
  'Tatlı',
  'Atıştırmalık',
  'Fast Food',
  'İçecek',
  'Şeker',
];

export default function QuickClickGame({ onComplete, onCancel }: QuickClickGameProps) {
  const [gameState, setGameState] = useState<'loading' | 'countdown' | 'playing' | 'result'>('loading');
  const [foods, setFoods] = useState<Food[]>([]);
  const [currentFood, setCurrentFood] = useState<Food | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [countdown, setCountdown] = useState(3);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; points: number } | null>(null);
  const [clickHistory, setClickHistory] = useState<Array<{
    food: string;
    isHealthy: boolean;
    clicked: boolean;
    correct: boolean;
    points: number;
  }>>([]);

  // Yiyecekleri yükle
  useEffect(() => {
    loadFoods();
  }, []);

  // Geri sayım
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('playing');
    }
  }, [gameState, countdown]);

  // Oyun timer'ı
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Yiyecek değiştirme
  useEffect(() => {
    if (gameState !== 'playing' || foods.length === 0) return;

    // İlk yiyeceği göster
    if (!currentFood) {
      showNextFood();
    }

    const interval = setInterval(() => {
      showNextFood();
    }, ITEM_DISPLAY_TIME);

    return () => clearInterval(interval);
  }, [gameState, foods, currentFood]);

  const loadFoods = async () => {
    try {
      setGameState('loading');

      // Food API'den yiyecekler getir
      const response = await fetch('/api/calories/foods?limit=200&random=true');

      if (!response.ok) {
        throw new Error('Yiyecekler yüklenemedi');
      }

      const data = await response.json();
      const allFoods = data.foods || [];

      if (allFoods.length < 20) {
        throw new Error('Yeterli yiyecek bulunamadı');
      }

      // Yiyecekleri sağlıklı/sağlıksız olarak işaretle
      const processedFoods: Food[] = allFoods.map((food: any) => ({
        id: food.id,
        name: food.name,
        category: food.category,
        calories: food.calories,
        isHealthy: isHealthyFood(food.category, food.calories),
      }));

      // Karışık bir liste oluştur (hem sağlıklı hem sağlıksız)
      const shuffled = processedFoods.sort(() => 0.5 - Math.random());

      setFoods(shuffled);
      setGameState('countdown');
    } catch (error) {
      console.error('Yiyecek yükleme hatası:', error);
      alert('Oyun başlatılamadı. Lütfen tekrar deneyin.');
      onCancel?.();
    }
  };

  const isHealthyFood = (category: string, calories: number): boolean => {
    // Kategori bazlı kontrol
    if (HEALTHY_CATEGORIES.some(cat => category.includes(cat))) {
      return true;
    }
    if (UNHEALTHY_CATEGORIES.some(cat => category.includes(cat))) {
      return false;
    }

    // Kalori bazlı kontrol (100g için)
    // 100g'da 200 kaloriden az olanlar genelde sağlıklı
    return calories < 200;
  };

  const showNextFood = () => {
    if (foods.length === 0) return;

    // Rastgele bir yiyecek seç
    const randomIndex = Math.floor(Math.random() * foods.length);
    const nextFood = foods[randomIndex];

    // Eğer tıklanmadıysa, tıklanmama olarak kaydet
    if (currentFood) {
      const wasCorrectToSkip = !currentFood.isHealthy;
      const points = wasCorrectToSkip ? CORRECT_POINTS : WRONG_PENALTY;

      if (wasCorrectToSkip) {
        setCorrectClicks((prev) => prev + 1);
      } else {
        setWrongClicks((prev) => prev + 1);
      }

      setScore((prev) => Math.max(0, prev + points));

      // Geçmişe ekle
      setClickHistory((prev) => [
        ...prev,
        {
          food: currentFood.name,
          isHealthy: currentFood.isHealthy,
          clicked: false,
          correct: wasCorrectToSkip,
          points,
        },
      ]);
    }

    setCurrentFood(nextFood);
    setFeedback(null);
  };

  const handleFoodClick = () => {
    if (!currentFood || gameState !== 'playing') return;

    const isCorrect = currentFood.isHealthy;
    const points = isCorrect ? CORRECT_POINTS : WRONG_PENALTY;

    setTotalClicks((prev) => prev + 1);

    if (isCorrect) {
      setCorrectClicks((prev) => prev + 1);
    } else {
      setWrongClicks((prev) => prev + 1);
    }

    setScore((prev) => Math.max(0, prev + points));

    // Feedback göster
    setFeedback({
      type: isCorrect ? 'correct' : 'wrong',
      points,
    });

    // Geçmişe ekle
    setClickHistory((prev) => [
      ...prev,
      {
        food: currentFood.name,
        isHealthy: currentFood.isHealthy,
        clicked: true,
        correct: isCorrect,
        points,
      },
    ]);

    // Hemen sonraki yiyeceği göster
    setTimeout(() => {
      showNextFood();
    }, 300);
  };

  const calculateReward = (): { coins: number; tier: string } => {
    if (score >= REWARD_TIERS.gold.minScore) {
      return { coins: REWARD_TIERS.gold.coins, tier: REWARD_TIERS.gold.label };
    } else if (score >= REWARD_TIERS.silver.minScore) {
      return { coins: REWARD_TIERS.silver.coins, tier: REWARD_TIERS.silver.label };
    } else if (score >= REWARD_TIERS.bronze.minScore) {
      return { coins: REWARD_TIERS.bronze.coins, tier: REWARD_TIERS.bronze.label };
    }
    return { coins: 0, tier: 'Tamamlandı' };
  };

  const finishGame = () => {
    setGameState('result');

    const { coins, tier } = calculateReward();
    const finalScore = coins; // Skor = kazanılan coin

    // Oyun verilerini hazırla
    const gameData = {
      score,
      correctClicks,
      wrongClicks,
      totalClicks,
      accuracy: totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 0,
      tier,
      clickHistory,
    };

    // Parent component'e bildir
    onComplete(finalScore, gameData);
  };

  const formatTime = (seconds: number): string => {
    return `${seconds}s`;
  };

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner className="w-12 h-12" />
        <p className="text-gray-600 dark:text-gray-400">Oyun hazırlanıyor...</p>
      </div>
    );
  }

  if (gameState === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Hazır mısınız?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sağlıklı yiyecekleri tıklayın, sağlıksız olanlardan kaçının!
          </p>
        </div>

        <div className="text-8xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">
          {countdown}
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Sağlıklı yiyecek = +{CORRECT_POINTS} puan</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>Sağlıksız yiyecek = {WRONG_PENALTY} puan</span>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const { coins, tier } = calculateReward();
    const accuracy = totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 0;

    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>

          <h2 className="text-3xl font-bold mb-2">Oyun Bitti!</h2>
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-6">
            {tier}
          </div>

          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 my-6">
            {score} Puan
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Doğru</div>
              <div className="text-2xl font-bold text-green-600">{correctClicks}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yanlış</div>
              <div className="text-2xl font-bold text-red-600">{wrongClicks}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Doğruluk</div>
              <div className="text-2xl font-bold">{accuracy}%</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400">
            <Coins className="w-6 h-6" />
            <span>+{coins} Coin kazandınız!</span>
          </div>
        </Card>

        {/* Performans detayları */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Performans Detayları</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-500" />
                <span>Toplam tıklama</span>
              </div>
              <span className="font-bold">{totalClicks}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Doğru seçim</span>
              </div>
              <span className="font-bold">{correctClicks}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <span>Yanlış seçim</span>
              </div>
              <span className="font-bold">{wrongClicks}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <span>Doğruluk oranı</span>
              </div>
              <span className="font-bold">{accuracy}%</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Ödül Seviyeleri:</strong>
              <div className="mt-2 space-y-1">
                <div>🥇 300+ puan = 100 coin</div>
                <div>🥈 200+ puan = 60 coin</div>
                <div>🥉 100+ puan = 30 coin</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tıklama geçmişi (son 10) */}
        {clickHistory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Son Hareketler</h3>
            <div className="space-y-2">
              {clickHistory.slice(-10).reverse().map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.correct
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{item.food}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.isHealthy ? 'Sağlıklı' : 'Sağlıksız'} -{' '}
                        {item.clicked ? 'Tıklandı' : 'Atlandı'}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;

  return (
    <div className="space-y-6">
      {/* Üst bilgi çubuğu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-2xl">{score} Puan</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-semibold">{correctClicks}</span>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="font-semibold">{wrongClicks}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          <span className={`font-bold text-2xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <Progress value={progress} className="h-2" />

      {/* Oyun alanı */}
      <Card className="p-8 min-h-[400px] flex flex-col items-center justify-center">
        {currentFood && (
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Sağlıklıysa tıkla, değilse atla!
            </div>

            <button
              onClick={handleFoodClick}
              className="w-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl p-12 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl"
            >
              <div className="text-6xl font-bold mb-4">{currentFood.name}</div>
              <div className="text-xl opacity-90">{currentFood.category}</div>
              <div className="text-sm opacity-75 mt-2">{Math.round(currentFood.calories)} kcal</div>
            </button>

            {/* Feedback animasyonu */}
            {feedback && (
              <div
                className={`text-3xl font-bold animate-bounce ${
                  feedback.type === 'correct' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {feedback.type === 'correct' ? `+${feedback.points}` : `${feedback.points}`}
              </div>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Yiyecek {ITEM_DISPLAY_TIME / 1000} saniye sonra değişecek
            </div>
          </div>
        )}

        {/* İptal butonu */}
        {onCancel && (
          <div className="mt-8">
            <Button type="button" variant="outline" onClick={onCancel}>
              Oyunu İptal Et
            </Button>
          </div>
        )}
      </Card>

      {/* İpucu */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
          <strong>İpucu:</strong> Sebze, meyve, tahıl gibi yiyecekler sağlıklıdır. Tatlı, fast food gibi
          yiyeceklerden kaçının!
        </div>
      </Card>
    </div>
  );
}
