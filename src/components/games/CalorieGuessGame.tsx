'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Trophy, Coins, Target, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * Kalori Tahmin Oyunu Bileşeni
 * 
 * Kullanıcıya rastgele yiyecekler gösterir ve kalori tahmini ister.
 * 10 soruluk oyun sonunda skora göre coin ödülü verir.
 */

interface Food {
  id: string;
  name: string;
  calories: number;
  category: string;
  servingSize: number;
}

interface GameQuestion {
  food: Food;
  userGuess: number | null;
  actualCalories: number;
  points: number;
  accuracy: number | null;
}

interface CalorieGuessGameProps {
  onComplete: (score: number, gameData: any) => void;
  onCancel?: () => void;
}

// Oyun ayarları
const QUESTION_COUNT = 10;
const TIME_PER_QUESTION = 30; // saniye

// Doğruluk seviyeleri
const ACCURACY_TIERS = {
  excellent: { range: 10, points: 100, label: 'Mükemmel!' },
  good: { range: 20, points: 50, label: 'İyi!' },
  fair: { range: 30, points: 25, label: 'Fena Değil!' },
};

export default function CalorieGuessGame({ onComplete, onCancel }: CalorieGuessGameProps) {
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'result'>('loading');
  const [foods, setFoods] = useState<Food[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [userGuess, setUserGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastQuestionResult, setLastQuestionResult] = useState<{
    points: number;
    accuracy: number;
    label: string;
  } | null>(null);

  // Yiyecekleri yükle
  useEffect(() => {
    loadFoods();
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Süre doldu, otomatik olarak 0 puan ver
          handleSubmitGuess(0);
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, showFeedback, currentQuestionIndex]);

  const loadFoods = async () => {
    try {
      setGameState('loading');
      
      // Food API'den rastgele yiyecekler getir
      const response = await fetch('/api/calories/foods?limit=100&random=true');
      
      if (!response.ok) {
        throw new Error('Yiyecekler yüklenemedi');
      }

      const data = await response.json();
      const allFoods = data.foods || [];

      if (allFoods.length < QUESTION_COUNT) {
        throw new Error('Yeterli yiyecek bulunamadı');
      }

      // Rastgele 10 yiyecek seç
      const shuffled = allFoods.sort(() => 0.5 - Math.random());
      const selectedFoods = shuffled.slice(0, QUESTION_COUNT);

      setFoods(selectedFoods);
      
      // Soruları hazırla
      const initialQuestions: GameQuestion[] = selectedFoods.map((food: Food) => ({
        food,
        userGuess: null,
        actualCalories: food.calories,
        points: 0,
        accuracy: null,
      }));

      setQuestions(initialQuestions);
      setGameState('playing');
    } catch (error) {
      console.error('Yiyecek yükleme hatası:', error);
      alert('Oyun başlatılamadı. Lütfen tekrar deneyin.');
      onCancel?.();
    }
  };

  const calculatePoints = (guess: number, actual: number): { points: number; accuracy: number; label: string } => {
    if (guess === 0) {
      return { points: 0, accuracy: 0, label: 'Süre Doldu!' };
    }

    const difference = Math.abs(guess - actual);
    const percentage = (difference / actual) * 100;

    if (percentage <= ACCURACY_TIERS.excellent.range) {
      return {
        points: ACCURACY_TIERS.excellent.points,
        accuracy: percentage,
        label: ACCURACY_TIERS.excellent.label,
      };
    } else if (percentage <= ACCURACY_TIERS.good.range) {
      return {
        points: ACCURACY_TIERS.good.points,
        accuracy: percentage,
        label: ACCURACY_TIERS.good.label,
      };
    } else if (percentage <= ACCURACY_TIERS.fair.range) {
      return {
        points: ACCURACY_TIERS.fair.points,
        accuracy: percentage,
        label: ACCURACY_TIERS.fair.label,
      };
    }

    return { points: 0, accuracy: percentage, label: 'Tekrar Dene!' };
  };

  const handleSubmitGuess = (guess: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const result = calculatePoints(guess, currentQuestion.actualCalories);

    // Soruyu güncelle
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userGuess: guess,
      points: result.points,
      accuracy: result.accuracy,
    };

    setQuestions(updatedQuestions);
    setTotalScore((prev) => prev + result.points);
    setLastQuestionResult(result);
    setShowFeedback(true);

    // 2 saniye sonra sonraki soruya geç veya oyunu bitir
    setTimeout(() => {
      setShowFeedback(false);
      setLastQuestionResult(null);
      setUserGuess('');
      setTimeLeft(TIME_PER_QUESTION);

      if (currentQuestionIndex < QUESTION_COUNT - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Oyun bitti
        const finalScore = totalScore + result.points;
        finishGame(updatedQuestions, finalScore);
      }
    }, 2000);
  };

  const finishGame = (finalQuestions: GameQuestion[], finalScore: number) => {
    setGameState('result');

    // Oyun verilerini hazırla
    const gameData = {
      questions: finalQuestions.map((q) => ({
        foodName: q.food.name,
        actualCalories: q.actualCalories,
        userGuess: q.userGuess,
        points: q.points,
        accuracy: q.accuracy,
      })),
      totalQuestions: QUESTION_COUNT,
      correctGuesses: finalQuestions.filter((q) => q.points > 0).length,
    };

    // Parent component'e bildir
    onComplete(finalScore, gameData);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guess = parseInt(userGuess);

    if (isNaN(guess) || guess < 0) {
      alert('Lütfen geçerli bir kalori değeri girin');
      return;
    }

    handleSubmitGuess(guess);
  };

  const currentFood = foods[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTION_COUNT) * 100;

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner className="w-12 h-12" />
        <p className="text-gray-600 dark:text-gray-400">Oyun hazırlanıyor...</p>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Oyun Bitti!</h2>
          
          <div className="text-5xl font-bold text-green-600 dark:text-green-400 my-6">
            {totalScore} Puan
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Doğru Tahmin</div>
              <div className="text-2xl font-bold">
                {questions.filter((q) => q.points > 0).length} / {QUESTION_COUNT}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ortalama Doğruluk</div>
              <div className="text-2xl font-bold">
                {Math.round(
                  questions.reduce((sum, q) => sum + (q.accuracy || 0), 0) / QUESTION_COUNT
                )}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400">
            <Coins className="w-6 h-6" />
            <span>Coin kazanıldı! (Hesaplanıyor...)</span>
          </div>
        </Card>

        {/* Soru detayları */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Soru Detayları</h3>
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {q.points > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">{q.food.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Gerçek: {Math.round(q.actualCalories)} kcal | Tahmininiz: {q.userGuess || 0} kcal
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{q.points} puan</div>
                  {q.accuracy !== null && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ±{Math.round(q.accuracy)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst bilgi çubuğu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">
              Soru {currentQuestionIndex + 1} / {QUESTION_COUNT}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{totalScore} Puan</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <Progress value={progress} className="h-2" />

      {/* Soru kartı */}
      <Card className="p-8">
        {showFeedback && lastQuestionResult ? (
          <div className="text-center space-y-4">
            <div
              className={`text-4xl font-bold ${
                lastQuestionResult.points > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {lastQuestionResult.label}
            </div>
            <div className="text-2xl">+{lastQuestionResult.points} Puan</div>
            <div className="text-gray-600 dark:text-gray-400">
              Gerçek kalori: {Math.round(currentFood.calories)} kcal
            </div>
            {lastQuestionResult.accuracy > 0 && (
              <div className="text-sm text-gray-500">
                Doğruluk: ±{Math.round(lastQuestionResult.accuracy)}%
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">
                Bu yiyeceğin kaç kalorisi var?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentFood.servingSize}g porsiyon için tahmin edin
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
                  {currentFood.name}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {currentFood.category}
                </div>
              </div>
            </div>

            <form onSubmit={handleGuessSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kalori Tahmininiz (kcal)
                </label>
                <Input
                  type="number"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  placeholder="Örn: 250"
                  min="0"
                  max="10000"
                  className="text-center text-2xl font-bold h-16"
                  autoFocus
                  disabled={showFeedback}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={!userGuess || showFeedback}
                >
                  Tahmin Et
                </Button>
                
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={showFeedback}
                  >
                    İptal
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>İpucu:</strong> ±10% doğruluk = 100 puan, ±20% = 50 puan, ±30% = 25 puan
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
