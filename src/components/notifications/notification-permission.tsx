'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Tarayıcı bildirimi destekliyor mu kontrol et
    if ('Notification' in window) {
      setPermission(Notification.permission);

      // İzin verilmemişse ve daha önce reddedilmemişse prompt göster
      if (Notification.permission === 'default') {
        // 3 saniye sonra göster (kullanıcı deneyimi için)
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  async function requestPermission() {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === 'granted') {
        // Test bildirimi göster
        new Notification('Bildirimler Aktif! 🎉', {
          body: 'Artık yeni bildirimlerinizi anında göreceksiniz.',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
        });
      }
    }
  }

  function dismissPrompt() {
    setShowPrompt(false);
    // 1 gün boyunca tekrar gösterme
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  }

  // Prompt gösterilmeyecekse veya izin zaten verilmişse hiçbir şey render etme
  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Bildirimleri Aç
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Yeni yorumlar, beğeniler ve diğer önemli güncellemeler için anlık bildirim al.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={requestPermission}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                İzin Ver
              </button>
              <button
                onClick={dismissPrompt}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              >
                Daha Sonra
              </button>
            </div>
          </div>

          <button
            onClick={dismissPrompt}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
