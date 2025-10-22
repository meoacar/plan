"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type LeaderboardType = "xp" | "likes" | "views";

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  xp: number;
  level: number;
  totalLikes?: number;
  totalViews?: number;
}

export function LeaderboardTable() {
  const [type, setType] = useState<LeaderboardType>("xp");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/gamification/leaderboard?type=${type}`);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [type]);

  const tabs = [
    { value: "xp", label: "En Yüksek XP", icon: "⭐" },
    { value: "likes", label: "En Çok Beğenilen", icon: "❤️" },
    { value: "views", label: "En Çok Görüntülenen", icon: "👀" },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-900">🏆 Liderlik Tablosu</h2>
      </div>

      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setType(tab.value as LeaderboardType)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              type === tab.value
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Yükleniyor...</div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Henüz veri yok
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 rounded-lg p-3 ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200"
                    : index === 2
                    ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold shadow-sm">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </div>

                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                      👤
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {user.name || "Anonim"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Seviye {user.level}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {type === "xp" && `${user.xp} XP`}
                    {type === "likes" && `${user.totalLikes || 0} ❤️`}
                    {type === "views" && `${user.totalViews || 0} 👀`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
