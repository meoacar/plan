'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import QuickClickGame from '@/components/games/QuickClickGame';
import { Zap, ArrowLeft, Info } from 'lucide-react';

export default function QuickClickGamePage() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGameComplete = async (score: number, gameData: any) => {
    try {
      setIsSubmitting(true);

      // Oyun sonucunu API'ye gönder
      const response = await fetch('/api/games/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameCode: 'QUICK_CLICK',
          score,
          gameData,
        }),
      });

      if (!response.ok) {
        throw new Error('Oyun sonucu kaydedilemedi');
      }

      const result = await response.json();
      console.log('Oyun tamamlandı:', result);

      // Başarı mesajı göster
      // Not: Oyun bileşeni zaten sonuç ekranını gösteriyor
    } catch (error) {
      console.error('Oyun tamamlama hatası:', error);
      alert('Oyun sonucu kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Oyunu iptal etmek istediğinize emin misiniz?')) {
      router.push('/games');
    }
  };

  const handleBackToGames = () => {
    router.push('/games');
  };

  if (!gameStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={handleBackToGames}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Oyunlara Dön
        </Button>

        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-2">Hızlı Tıklama Challenge</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Reflekslerinizi test edin ve coin kazanın!
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-left">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Nasıl Oynanır?</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• 30 saniye süreniz var</li>
                    <li>• Ekranda rastgele yiyecekler belirecek</li>
                    <li>• <strong>Sağlıklı yiyecekleri tıklayın</strong> (sebze, meyve, tahıl vb.)</li>
                    <li>• <strong>Sağlıksız yiyecekleri atlayın</strong> (tatlı, fast food vb.)</li>
                    <li>• Her doğru seçim +10 puan kazandırır</li>
                    <li>• Her yanlış seçim -5 puan kaybettirir</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-1">🥇</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Altın</div>
                <div className="font-bold">300+ puan</div>
                <div className="text-sm text-green-600">100 coin</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-3xl font-bold text-gray-400 mb-1">🥈</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gümüş</div>
                <div className="font-bold">200+ puan</div>
                <div className="text-sm text-green-600">60 coin</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">🥉</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bronz</div>
                <div className="font-bold">100+ puan</div>
                <div className="text-sm text-green-600">30 coin</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setGameStarted(true)}
                className="px-8"
              >
                <Zap className="w-5 h-5 mr-2" />
                Oyunu Başlat
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleBackToGames}
              >
                İptal
              </Button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              💡 İpucu: Hızlı düşünün ama aceleci olmayın. Doğruluk önemli!
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hızlı Tıklama Challenge</h1>
        {!isSubmitting && (
          <Button
            variant="ghost"
            onClick={handleBackToGames}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Oyunlara Dön
          </Button>
        )}
      </div>

      {isSubmitting ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Spinner className="w-12 h-12" />
            <p className="text-gray-600 dark:text-gray-400">Sonuçlar kaydediliyor...</p>
          </div>
        </Card>
      ) : (
        <QuickClickGame
          onComplete={handleGameComplete}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
