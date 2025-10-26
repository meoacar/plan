"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";

const CHEAT_EMOJIS: Record<string, string> = {
  SWEET: "🍰",
  FAST_FOOD: "🍟",
  SODA: "🥤",
  ALCOHOL: "🍺",
  OTHER: "🌮",
};

interface CheatMeal {
  id: string;
  type: string;
  date: string;
}

interface CheatMealCalendarProps {
  refreshTrigger?: number;
}

export default function CheatMealCalendar({ refreshTrigger }: CheatMealCalendarProps) {
  const { data: session } = useSession();
  const [cheatMeals, setCheatMeals] = useState<CheatMeal[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    if (session?.user) {
      fetchCheatMeals();
    }
  }, [session]);

  // Kaçamak eklendiğinde yeniden yükle
  useEffect(() => {
    if (session?.user && refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchCheatMeals();
    }
  }, [refreshTrigger, session]);

  const fetchCheatMeals = async () => {
    try {
      const res = await fetch("/api/cheat-meals?period=week");
      const data = await res.json();
      setCheatMeals(data.cheatMeals || []);
    } catch (error) {
      console.error("Error fetching cheat meals:", error);
    }
  };

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getCheatsForDay = (day: Date) => {
    return cheatMeals.filter((meal) => isSameDay(new Date(meal.date), day));
  };

  const getCleanStreak = () => {
    let streak = 0;
    const days = getWeekDays().reverse();
    for (const day of days) {
      if (getCheatsForDay(day).length === 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const cleanStreak = getCleanStreak();
  const isLongStreak = cleanStreak >= 7;

  if (!session?.user) return null;

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg border border-gray-200 ${
      isLongStreak ? "animate-pulse-glow" : ""
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">📅 Haftalık Takvim</h3>
        {cleanStreak > 0 && (
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isLongStreak
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-bounce"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isLongStreak ? "✨🔥" : "🔥"} {cleanStreak} gün temiz!
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {getWeekDays().map((day, index) => {
          const cheats = getCheatsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isClean = cheats.length === 0;

          return (
            <div
              key={index}
              className={`relative aspect-square rounded-lg p-2 transition-all ${
                isToday
                  ? "ring-2 ring-orange-500 bg-orange-50"
                  : isClean
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  {format(day, "EEE", { locale: tr })}
                </div>
                <div className="text-sm font-bold text-gray-800 mb-1">
                  {format(day, "d")}
                </div>
                {isClean ? (
                  <div className="text-2xl">✨</div>
                ) : (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {cheats.map((cheat) => (
                      <span key={cheat.id} className="text-lg">
                        {CHEAT_EMOJIS[cheat.type]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Melek ve Şeytan Animasyonu */}
      <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">👼</span>
          <div className="text-sm">
            {cleanStreak >= 3 ? (
              <p className="font-semibold text-blue-700">Aferin, {cleanStreak} gündür kaçamak yok! 💪</p>
            ) : (
              <p className="text-gray-600">Devam et, başarabilirsin! 🌟</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-right">
            {cheatMeals.length > 0 ? (
              <p className="text-gray-600">Sadece {cheatMeals.length} kaçamak 🙄</p>
            ) : (
              <p className="text-gray-400">Sıkıcı hafta... 😴</p>
            )}
          </div>
          <span className="text-3xl">😈</span>
        </div>
      </div>
    </div>
  );
}
