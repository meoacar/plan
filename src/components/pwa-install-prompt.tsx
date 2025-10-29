'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Daha önce dismiss edilmişse gösterme
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:inset-x-auto">
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 md:rounded-2xl shadow-2xl overflow-hidden">
        {/* Decorative top bar - mobile only */}
        <div className="h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 md:hidden" />
        
        <div className="p-5 md:p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
                <svg
                  className="w-8 h-8 md:w-6 md:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-base font-bold text-white mb-1.5 md:mb-1">
                Uygulamayı Yükle
              </h3>
              <p className="text-sm md:text-xs text-white/90 leading-relaxed mb-4 md:mb-3">
                Zayıflama Planım'ı telefonunuza yükleyin, daha hızlı erişin!
              </p>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row gap-2.5 md:gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 px-5 py-3.5 md:px-4 md:py-2 bg-white text-purple-700 text-base md:text-sm font-bold rounded-xl md:rounded-lg hover:bg-purple-50 active:scale-95 transition-all shadow-lg"
                >
                  Yükle
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-5 py-3.5 md:px-4 md:py-2 text-white/90 text-base md:text-sm font-semibold hover:text-white active:scale-95 transition-all"
                >
                  Şimdi Değil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-safe-area-inset-bottom md:hidden" />
      </div>
    </div>
  );
}
