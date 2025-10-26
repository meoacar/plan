"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Gift } from "lucide-react";

interface UnlockedItem {
  type: string;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

interface BadgeUnlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  badgeIcon?: string;
  xpReward: number;
  unlockedItems?: UnlockedItem[];
}

export default function BadgeUnlockedModal({
  isOpen,
  onClose,
  badgeName,
  badgeIcon = "🏆",
  xpReward,
  unlockedItems = [],
}: BadgeUnlockedModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const typeLabels: Record<string, string> = {
    FRAME: "Çerçeve",
    BACKGROUND: "Arka Plan",
    THEME: "Tema",
    BADGE: "Rozet",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {["🎉", "✨", "⭐", "🎊", "💫"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Badge Icon */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <div className="text-8xl mb-4 animate-bounce">{badgeIcon}</div>
            <div className="absolute -top-2 -right-2 animate-ping">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tebrikler! 🎉
          </h2>
          <p className="text-xl font-semibold text-emerald-600 mb-2">
            {badgeName}
          </p>
          <p className="text-gray-600">rozetini kazandın!</p>
        </div>

        {/* XP Reward */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">⚡</span>
            <span className="text-lg font-bold text-gray-900">
              +{xpReward} XP
            </span>
          </div>
        </div>

        {/* Unlocked Items */}
        {unlockedItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Gift className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Yeni Öğeler Açıldı!
              </h3>
            </div>

            <div className="space-y-3">
              {unlockedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 flex items-center space-x-3 animate-slideInRight"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {item.name[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                        {typeLabels[item.type] || item.type}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xl">✨</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <a
                href="/profile/customization"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Profil Özelleştirme &rarr;
              </a>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all transform hover:scale-105"
        >
          Harika! 🎊
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
