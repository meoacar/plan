'use client';

import { useState } from 'react';

interface CrisisButtonProps {
  className?: string;
}

export function CrisisButton({ className = '' }: CrisisButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-full shadow-2xl font-bold text-lg hover:scale-105 hover:shadow-red-500/50 transition-all active:scale-95 animate-pulse ${className}`}
      >
        🆘 Kriz Anı!
      </button>

      {showModal && (
        <CrisisModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

interface CrisisModalProps {
  onClose: () => void;
}

function CrisisModal({ onClose }: CrisisModalProps) {
  const [step, setStep] = useState<'trigger' | 'motivation' | 'success'>('trigger');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolveData, setResolveData] = useState<{
    xpReward: number;
    message: string;
    dailyCount?: number;
    dailyLimit?: number;
  } | null>(null);

  const triggers = [
    { id: 'food_craving', label: '🍕 Yemek İsteği', emoji: '🍕' },
    { id: 'motivation_low', label: '😔 Motivasyon Düşük', emoji: '😔' },
    { id: 'stress_eating', label: '😰 Stresli Hissediyorum', emoji: '😰' },
    { id: 'boredom', label: '😴 Can Sıkıntısı', emoji: '😴' },
  ];

  const motivationMessages = {
    food_craving: [
      '🔥 Dur bir dakika! Bu his geçici, ama hedefin kalıcı!',
      '💪 Şu ana kadar geldiğin yolu düşün. Bunu hak ettin mi?',
      '⏰ 20 dakika bekle. Gerçek açlık mı, yoksa duygusal mı?',
      '🎯 Hedef kilona ne kadar yakınsın? Bunu riske atmaya değer mi?',
      '🌟 Yarın sabah aynaya baktığında gurur duyacak mısın?',
    ],
    motivation_low: [
      '🚀 Her gün yeni bir başlangıç! Sen yapabilirsin!',
      '💎 Değişim kolay olsaydı, herkes yapardı. Sen farklısın!',
      '🏆 Başarı, küçük adımların toplamıdır. Bugün bir adım at!',
      '🌈 Zorlu günler, güçlü insanlar yaratır. Sen güçlüsün!',
      '⭐ Kendine inan! Buraya kadar geldiysen, sonuna kadar gidebilirsin!',
    ],
    stress_eating: [
      '🧘 Derin bir nefes al. Stres geçici, sağlığın kalıcı.',
      '🎨 Yemek yerine başka bir şey dene: Yürüyüş, müzik, kitap...',
      '💚 Vücudun seni seviyor. Ona stresle değil, sevgiyle davran.',
      '🌊 Bu dalga geçecek. Sen güçlüsün, kontrol sende!',
      '🎯 Stresi yemekle değil, hareketle at! 10 dakika yürü.',
    ],
    boredom: [
      '🎮 Can sıkıntısı = Yemek değil! Başka bir aktivite bul.',
      '📚 Kitap oku, müzik dinle, arkadaşını ara. Ama yeme!',
      '🏃 Sıkıldın mı? Hareket et! 5 dakika egzersiz yap.',
      '🎨 Yaratıcı ol! Hobinle ilgilen, yeni bir şey öğren.',
      '💪 Can sıkıntısı geçici, pişmanlık kalıcı. Akıllı seç!',
    ],
  };

  const handleTriggerSelect = async (triggerId: string) => {
    setSelectedTrigger(triggerId);
    setStep('motivation');

    // API'ye kaydet
    try {
      await fetch('/api/crisis-button', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: triggerId }),
      });
    } catch (error) {
      console.error('Kriz anı kaydedilemedi:', error);
    }
  };

  const handleResolved = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/crisis-button/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: selectedTrigger }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResolveData(data);
        setStep('success');
      } else {
        const errorData = await response.json();
        console.error('Çözüm kaydedilemedi:', errorData);
        alert('Kriz çözümü kaydedilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Çözüm kaydedilemedi:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMessages = selectedTrigger
    ? motivationMessages[selectedTrigger as keyof typeof motivationMessages]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
      >
        {step === 'trigger' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🆘 Kriz Anı Desteği
              </h2>
              <p className="text-gray-600">
                Ne hissediyorsun? Sana yardımcı olalım!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {triggers.map((trigger) => (
                <button
                  key={trigger.id}
                  onClick={() => handleTriggerSelect(trigger.id)}
                  className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:scale-105 active:scale-95 transition-all text-left"
                >
                  <div className="text-4xl mb-2">{trigger.emoji}</div>
                  <div className="font-semibold text-gray-900">
                    {trigger.label}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              İptal
            </button>
          </div>
        )}

        {step === 'motivation' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                💪 Motivasyon Bombardımanı!
              </h2>
              <p className="text-gray-600">
                Bu mesajları oku ve güçlen!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {currentMessages.map((message, index) => (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 animate-slideInLeft"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-lg font-medium text-gray-900">
                    {message}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">
                🎯 Hemen Yapabileceklerin:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Bir bardak su iç</li>
                <li>✅ 10 derin nefes al</li>
                <li>✅ 5 dakika yürüyüş yap</li>
                <li>✅ Hedeflerini tekrar oku</li>
                <li>✅ Başarı fotoğraflarına bak</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleResolved}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : '✅ Krizi Atlattım!'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="text-8xl mb-6 animate-bounce">
              🎉
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Harikasın! 🌟
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {resolveData?.message || 'Krizi atlattın! Bu büyük bir başarı. Kendini tebrik et! 💪'}
            </p>
            
            {resolveData && resolveData.xpReward > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                <p className="text-lg font-medium text-gray-900">
                  +{resolveData.xpReward} XP Kazandın! 🏆
                </p>
                <p className="text-gray-600 mt-2">
                  Her kriz anını atlatmak seni daha güçlü yapıyor!
                </p>
                {resolveData.dailyCount && resolveData.dailyLimit && (
                  <p className="text-sm text-gray-500 mt-2">
                    Bugün {resolveData.dailyCount}/{resolveData.dailyLimit} kriz çözümü
                  </p>
                )}
              </div>
            )}

            {resolveData && resolveData.xpReward === 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                <p className="text-gray-700">
                  Kriz atlatıldı! 💪
                </p>
                {resolveData.dailyCount && resolveData.dailyLimit && (
                  <p className="text-sm text-gray-500 mt-2">
                    Bugün {resolveData.dailyCount}/{resolveData.dailyLimit} kriz çözümü
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  💡 XP kazanmak için kriz çözümleri arasında en az 1 saat beklemen gerekiyor.
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
            >
              Devam Et! 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
