'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface BadgeNotificationProps {
  badge: Badge | null;
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (badge) {
      setShow(true);
      // 5 saniye sonra otomatik kapat
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badge]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Animasyon bitsin diye bekle
  };

  if (!badge) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative mx-4 max-w-md transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti efekti için arka plan */}
        <div className="absolute inset-0 -z-10 animate-pulse">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-50 blur-xl"></div>
        </div>

        {/* Ana kart */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Üst gradient */}
          <div className="h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"></div>

          {/* Kapatma butonu */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          {/* İçerik */}
          <div className="p-8 text-center">
            {/* Animasyonlu icon */}
            <div className="mb-4 animate-bounce">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 text-6xl shadow-lg">
                {badge.icon}
              </div>
            </div>

            {/* Başlık */}
            <h2 className="mb-2 text-3xl font-black text-gray-900">
              🎉 Tebrikler!
            </h2>

            {/* Rozet adı */}
            <div className="mb-3">
              <div className="inline-block rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 text-lg font-bold text-white shadow-lg">
                {badge.name}
              </div>
            </div>

            {/* Açıklama */}
            <p className="mb-4 text-gray-600">{badge.description}</p>

            {/* XP ödülü */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white shadow-lg">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold">+{badge.xpReward} XP</span>
              </div>
            </div>

            {/* Buton */}
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Harika! 🚀
            </button>
          </div>

          {/* Alt dekorasyon */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400"></div>
        </div>

        {/* Parıltı efektleri */}
        <div className="pointer-events-none absolute -left-4 -top-4 h-8 w-8 animate-ping rounded-full bg-yellow-400 opacity-75"></div>
        <div className="pointer-events-none absolute -right-4 -top-4 h-6 w-6 animate-ping rounded-full bg-pink-400 opacity-75 delay-100"></div>
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-6 w-6 animate-ping rounded-full bg-purple-400 opacity-75 delay-200"></div>
        <div className="pointer-events-none absolute -bottom-4 -right-4 h-8 w-8 animate-ping rounded-full bg-orange-400 opacity-75 delay-300"></div>
      </div>
    </div>
  );
}
