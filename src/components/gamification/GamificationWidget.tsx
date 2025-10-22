"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
  badgeCount: number;
  planCount: number;
  progress: number;
}

export function GamificationWidget() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/gamification/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Stats fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="h-24 animate-pulse bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <Link
      href="/gamification"
      className="block rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 shadow-sm transition-all hover:shadow-md hover:scale-105"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">🎮 Gamification</h3>
        <span className="text-xs text-gray-500">Detaylar →</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-white/80 p-2">
          <div className="text-xs text-gray-600">Seviye</div>
          <div className="text-xl font-bold text-blue-600">{stats.level}</div>
        </div>

        <div className="rounded-md bg-white/80 p-2">
          <div className="text-xs text-gray-600">XP</div>
          <div className="text-xl font-bold text-purple-600">{stats.xp}</div>
        </div>

        <div className="rounded-md bg-white/80 p-2">
          <div className="text-xs text-gray-600">Streak</div>
          <div className="text-xl font-bold text-orange-600">
            {stats.streak} 🔥
          </div>
        </div>

        <div className="rounded-md bg-white/80 p-2">
          <div className="text-xs text-gray-600">Rozetler</div>
          <div className="text-xl font-bold text-yellow-600">
            {stats.badgeCount} 🏅
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Seviye İlerlemesi</span>
          <span>{Math.round(stats.progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
