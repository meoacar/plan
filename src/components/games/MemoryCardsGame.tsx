'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Trophy, Coins, Target, Clock, CheckCircle, RotateCcw } from 'lucide-react';

/**
 * Hafıza Kartları Oyunu Bileşeni
 * 
 * 4x4 grid'de 8 çift yiyecek kartı gösterir.
 * Kullanıcı kartları açarak eşleşmeleri bulmaya çalışır.
 * Hamle sayısı ve süreye göre coin ödülü verir.
 */

interface MemoryCard {
  id: string;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardsGameProps {
  onComplete: (score: number, gameData: any) => void;
  onCancel?: () => void;
}

// Sağlıklı yiyecek emojileri ve isimleri
const HEALTHY_FOODS = [
  { emoji: '🥗', name: 'Salata' },
  { emoji: '🥑', name: 'Avokado' },
  { emoji: '🥦', name: 'Brokoli' },
  { emoji: '🍎', name: 'Elma' },
  { emoji: '🍊', name: 'Portakal' },
  { emoji: '🥕', name: 'Havuç' },
  { emoji: '🍇', name: 'Üzüm' },
  { emoji: '🍓', name: 'Çilek' },
];

// Oyun ayarları
const GRID_SIZE = 16; // 4x4
const PAIR_COUNT = 8;
const CARD_REVEAL_TIME = 1000; // ms

// Ödül seviyeleri (hamle sayısına göre)
const REWARD_TIERS = {
  gold: { maxMoves: 20, coins: 100, label: 'Altın!' },
  silver: { maxMoves: 30, coins: 50, label: 'Gümüş!' },
  bronze: { maxMoves: 40, coins: 25, label: 'Bronz!' },
};

export default function MemoryCardsGame({ onComplete, onCancel }: MemoryCardsGameProps) {
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'result'>('loading');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Oyunu başlat
  useEffect(() => {
    initializeGame();
  }, []);

  // Süre sayacı
  useEffect(() => {
    if (gameState !== 'playing' || !startTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, startTime]);

  // Oyun tamamlanma kontrolü
  useEffect(() => {
    if (matchedPairs === PAIR_COUNT && gameState === 'playing') {
      finishGame();
    }
  }, [matchedPairs, gameState]);

  const initializeGame = () => {
    try {
      setGameState('loading');

      // Rastgele 8 yiyecek seç
      const selectedFoods = [...HEALTHY_FOODS]
        .sort(() => 0.5 - Math.random())
        .slice(0, PAIR_COUNT);

      // Her yiyecekten 2 kart oluştur
      const cardPairs: MemoryCard[] = [];
      selectedFoods.forEach((food, index) => {
        // İlk kart
        cardPairs.push({
          id: `${index}-a`,
          emoji: food.emoji,
          name: food.name,
          isFlipped: false,
          isMatched: false,
        });
        // İkinci kart
        cardPairs.push({
          id: `${index}-b`,
          emoji: food.emoji,
          name: food.name,
          isFlipped: false,
          isMatched: false,
        });
      });

      // Kartları karıştır
      const shuffledCards = cardPairs.sort(() => 0.5 - Math.random());

      setCards(shuffledCards);
      setGameState('playing');
      setStartTime(new Date());
    } catch (error) {
      console.error('Oyun başlatma hatası:', error);
      alert('Oyun başlatılamadı. Lütfen tekrar deneyin.');
      onCancel?.();
    }
  };

  const handleCardClick = (cardId: string) => {
    // Kontrol yapılıyorsa veya kart zaten açıksa tıklamayı engelle
    if (isChecking) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Zaten 2 kart açıksa tıklamayı engelle
    if (flippedCards.length >= 2) return;

    // Kartı aç
    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // 2 kart açıldıysa kontrol et
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      checkMatch(newFlippedCards, newCards);
    }
  };

  const checkMatch = (flippedCardIds: string[], currentCards: MemoryCard[]) => {
    setIsChecking(true);

    const [firstId, secondId] = flippedCardIds;
    const firstCard = currentCards.find((c) => c.id === firstId);
    const secondCard = currentCards.find((c) => c.id === secondId);

    if (!firstCard || !secondCard) {
      setIsChecking(false);
      return;
    }

    // Eşleşme kontrolü (emoji'ye göre)
    const isMatch = firstCard.emoji === secondCard.emoji;

    setTimeout(() => {
      if (isMatch) {
        // Eşleşti - kartları eşleşmiş olarak işaretle
        const newCards = currentCards.map((c) =>
          c.id === firstId || c.id === secondId
            ? { ...c, isMatched: true }
            : c
        );
        setCards(newCards);
        setMatchedPairs((prev) => prev + 1);
      } else {
        // Eşleşmedi - kartları kapat
        const newCards = currentCards.map((c) =>
          c.id === firstId || c.id === secondId
            ? { ...c, isFlipped: false }
            : c
        );
        setCards(newCards);
      }

      setFlippedCards([]);
      setIsChecking(false);
    }, CARD_REVEAL_TIME);
  };

  const calculateScore = (): { coins: number; tier: string } => {
    if (moves <= REWARD_TIERS.gold.maxMoves) {
      return { coins: REWARD_TIERS.gold.coins, tier: REWARD_TIERS.gold.label };
    } else if (moves <= REWARD_TIERS.silver.maxMoves) {
      return { coins: REWARD_TIERS.silver.coins, tier: REWARD_TIERS.silver.label };
    } else if (moves <= REWARD_TIERS.bronze.maxMoves) {
      return { coins: REWARD_TIERS.bronze.coins, tier: REWARD_TIERS.bronze.label };
    }
    return { coins: 0, tier: 'Tamamlandı' };
  };

  const finishGame = () => {
    setGameState('result');

    const { coins, tier } = calculateScore();
    const score = coins; // Skor = kazanılan coin

    // Oyun verilerini hazırla
    const gameData = {
      moves,
      matchedPairs,
      elapsedTime,
      tier,
    };

    // Parent component'e bildir
    onComplete(score, gameData);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner className="w-12 h-12" />
        <p className="text-gray-600 dark:text-gray-400">Oyun hazırlanıyor...</p>
      </div>
    );
  }

  if (gameState === 'result') {
    const { coins, tier } = calculateScore();

    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>

          <h2 className="text-3xl font-bold mb-2">Tebrikler!</h2>
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-6">
            {tier}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hamle</div>
              <div className="text-2xl font-bold">{moves}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Süre</div>
              <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Eşleşme</div>
              <div className="text-2xl font-bold">{matchedPairs}/{PAIR_COUNT}</div>
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
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Tüm eşleşmeler bulundu</span>
              </div>
              <span className="font-bold">{matchedPairs}/{PAIR_COUNT}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-500" />
                <span>Toplam hamle sayısı</span>
              </div>
              <span className="font-bold">{moves}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-500" />
                <span>Tamamlanma süresi</span>
              </div>
              <span className="font-bold">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Ödül Seviyeleri:</strong>
              <div className="mt-2 space-y-1">
                <div>🥇 20 hamle veya altı = 100 coin</div>
                <div>🥈 30 hamle veya altı = 50 coin</div>
                <div>🥉 40 hamle veya altı = 25 coin</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const progress = (matchedPairs / PAIR_COUNT) * 100;

  return (
    <div className="space-y-6">
      {/* Üst bilgi çubuğu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">
              {matchedPairs} / {PAIR_COUNT} Eşleşme
            </span>
          </div>

          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">{moves} Hamle</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-500" />
          <span className="font-bold">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <Progress value={progress} className="h-2" />

      {/* Oyun kartları - 4x4 Grid */}
      <Card className="p-6">
        <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped || isChecking}
              className={`
                aspect-square rounded-xl border-2 transition-all duration-300 transform
                ${
                  card.isMatched
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 scale-95 opacity-50'
                    : card.isFlipped
                    ? 'bg-white dark:bg-gray-800 border-blue-500 scale-105'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-600 hover:scale-105 hover:shadow-lg'
                }
                ${isChecking ? 'cursor-not-allowed' : 'cursor-pointer'}
                disabled:cursor-not-allowed
              `}
            >
              <div className="w-full h-full flex items-center justify-center">
                {card.isFlipped || card.isMatched ? (
                  <div className="text-center">
                    <div className="text-4xl mb-1">{card.emoji}</div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {card.name}
                    </div>
                  </div>
                ) : (
                  <div className="text-4xl text-white">❓</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* İpucu */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
            <strong>İpucu:</strong> Aynı yiyecekleri eşleştirin. Daha az hamle = Daha fazla coin!
          </div>
        </div>

        {/* İptal butonu */}
        {onCancel && (
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isChecking}
            >
              Oyunu İptal Et
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
