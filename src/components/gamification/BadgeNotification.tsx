"use client";

import { useEffect, useState } from "react";

interface BadgeNotificationProps {
  badgeName: string;
  badgeIcon: string;
  xpReward: number;
  onClose: () => void;
}

export function BadgeNotification({
  badgeName,
  badgeIcon,
  xpReward,
  onClose,
}: BadgeNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animasyon için kısa gecikme
    setTimeout(() => setVisible(true), 100);

    // 5 saniye sonra otomatik kapat
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div className="rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="text-4xl animate-bounce">{badgeIcon}</div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              🎉 Yeni Rozet Kazandın!
            </div>
            <div className="text-lg font-bold text-yellow-600">
              {badgeName}
            </div>
            <div className="text-xs text-gray-600">+{xpReward} XP</div>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
