'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CalorieGuessGame from '@/components/games/CalorieGuessGame';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';

/**
 * Kalori Tahmin Oyunu Sayfası
 * 
 * Kullanıcıların kalori tahmin oyununu oynayabileceği sayfa
 */
export default function CalorieGuessGamePage() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const handleStartGame = async () => {
    try {
      setIsStarting(true);

      // Oyun oturumu başlat
      const response = await fetch('/api/games/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameCode: 'CALORIE_GUESS',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Oyun başlatılamadı');
      }

      const data = await response.json();
      setSessionId(data.data.sessionId);
      setGameStarted(true);
    } catch (error) {
      console.error('Oyun başlatma hatası:', error);
      alert(error instanceof Error ? error.message : 'Oyun başlatılamadı');
    } finally {
      setIsStarting(false);
    }
  };

  const handleGameComplete = async (score: number, gameData: any) => {
    try {
      if (!sessionId) {
        throw new Error('Oyun oturumu bulunamadı');
      }

      // Oyunu tamamla ve coin kazan
      const response = await fetch('/api/games/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          score,
          gameData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Oyun tamamlanamadı');
      }

      const result = await response.json();
      console.log('Oyun tamamlandı:', result);
      
      setGameCompleted(true);
    } catch (error) {
      console.error('Oyun tamamlama hatası:', error);
      alert(error instanceof Error ? error.message : 'Oyun tamamlanamadı');
    }
  };

  const handleCancel = () => {
    if (confirm('Oyunu iptal etmek istediğinize emin misiniz?')) {
      setGameStarted(false);
      setSessionId(null);
      setGameCompleted(false);
    }
  };

  const handlePlayAgain = () => {
    setGameStarted(false);
    setSessionId(null);
    setGameCompleted(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>

        <h1 className="text-4xl font-bold mb-2">Kalori Tahmin Oyunu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Yiyeceklerin kalorisini tahmin ederek puan kazan ve coin kazan!
        </p>
      </div>

      {/* Oyun içeriği */}
      {!gameStarted ? (
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="text-6xl">🎯</div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Nasıl Oynanır?</h2>
              <div className="text-left max-w-md mx-auto space-y-3 text-gray-600 dark:text-gray-400">
                <p>• 10 farklı yiyecek gösterilecek</p>
                <p>• Her soru için 30 saniye süreniz var</p>
                <p>• Kalori tahmininizi girin</p>
                <p>• ±10% doğruluk = 100 puan</p>
                <p>• ±20% doğruluk = 50 puan</p>
                <p>• ±30% doğruluk = 25 puan</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-lg">
              <div className="text-lg font-semibold mb-2">Ödüller</div>
              <div className="space-y-1 text-sm">
                <p>🥉 100+ puan = 50 coin</p>
                <p>🥈 500+ puan = 100 coin</p>
                <p>🥇 800+ puan = 200 coin</p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleStartGame}
              disabled={isStarting}
              className="w-full max-w-xs"
            >
              {isStarting ? (
                'Başlatılıyor...'
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Oyunu Başlat
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          <CalorieGuessGame
            onComplete={handleGameComplete}
            onCancel={handleCancel}
          />

          {gameCompleted && (
            <div className="mt-6 text-center">
              <Button onClick={handlePlayAgain} size="lg">
                Tekrar Oyna
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
