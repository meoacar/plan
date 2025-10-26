"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Badge {
  id: string;
  earnedAt: string;
  badge: {
    type: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  };
}

const BADGE_INFO: Record<string, { emoji: string; color: string; title: string }> = {
  CHEAT_FREE_7_DAYS: {
    emoji: "🥇",
    color: "from-yellow-400 to-yellow-600",
    title: "Glukozsuz Kahraman",
  },
  CHEAT_FREE_30_DAYS: {
    emoji: "💎",
    color: "from-blue-400 to-blue-600",
    title: "Süper Disiplinli",
  },
  FAST_FOOD_FREE_30_DAYS: {
    emoji: "🥈",
    color: "from-green-400 to-green-600",
    title: "Yağsavar",
  },
  BALANCED_RECOVERY: {
    emoji: "🥉",
    color: "from-purple-400 to-purple-600",
    title: "Dengeli Dahi",
  },
};

export default function CheatMealBadges() {
  const { data: session } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      fetchBadges();
    }
  }, [session]);

  const fetchBadges = async () => {
    try {
      const res = await fetch("/api/cheat-meals/badges");
      const data = await res.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkNewBadges = async () => {
    try {
      const res = await fetch("/api/cheat-meals/badges", { method: "POST" });
      const data = await res.json();
      if (data.newBadges && data.newBadges.length > 0) {
        setNewBadge(data.newBadges[0]);
        setTimeout(() => {
          setNewBadge(null);
          fetchBadges();
        }, 5000);
      }
    } catch (error) {
      console.error("Error checking badges:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      checkNewBadges();
    }
  }, [session]);

  if (!session?.user) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-yellow-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏆 Rozetlerim
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {badges.length} rozet kazandın!
            </p>
          </div>
        </div>

        {badges.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600 mb-2">Henüz rozet kazanmadın</p>
            <p className="text-sm text-gray-500">
              Kaçamak yapmadan günler geçtikçe rozetler kazanacaksın!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((userBadge) => {
              const info = BADGE_INFO[userBadge.badge.type];
              if (!info) return null;

              return (
                <div
                  key={userBadge.id}
                  className={`relative bg-gradient-to-br ${info.color} rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-all`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{info.emoji}</div>
                    <div className="font-bold text-sm mb-1">{info.title}</div>
                    <div className="text-xs opacity-90">
                      +{userBadge.badge.xpReward} XP
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                    ✓
                  </div>
                </div>
              );
            })}

            {/* Locked badges */}
            {Object.entries(BADGE_INFO)
              .filter(
                ([type]) =>
                  !badges.some((b) => b.badge.type === type)
              )
              .map(([type, info]) => (
                <div
                  key={type}
                  className="relative bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300 opacity-50"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2 grayscale">{info.emoji}</div>
                    <div className="font-bold text-sm text-gray-600 mb-1">
                      {info.title}
                    </div>
                    <div className="text-xs text-gray-500">🔒 Kilitli</div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Badge descriptions */}
        <div className="mt-6 bg-white rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold text-gray-800 mb-3">Nasıl Kazanılır?</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xl">🥇</span>
              <div>
                <span className="font-semibold">Glukozsuz Kahraman:</span>{" "}
                <span className="text-gray-600">7 gün kaçamak yok</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🥈</span>
              <div>
                <span className="font-semibold">Yağsavar:</span>{" "}
                <span className="text-gray-600">30 gün fast food yok</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🥉</span>
              <div>
                <span className="font-semibold">Dengeli Dahi:</span>{" "}
                <span className="text-gray-600">
                  Kaçamak sonrası 3 gün telafi
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">💎</span>
              <div>
                <span className="font-semibold">Süper Disiplinli:</span>{" "}
                <span className="text-gray-600">30 gün kaçamak yok</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Badge Notification */}
      {newBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center animate-bounce-in">
            <div className="text-7xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Yeni Rozet Kazandın!
            </h3>
            <div className="text-6xl my-6">
              {BADGE_INFO[newBadge.type]?.emoji}
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {newBadge.name}
            </p>
            <p className="text-lg text-green-600 font-bold">
              +{newBadge.xp} XP
            </p>
          </div>
        </div>
      )}
    </>
  );
}
