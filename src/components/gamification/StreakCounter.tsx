"use client";

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-5xl">🔥</div>
        <div>
          <h3 className="text-3xl font-bold text-orange-600">{streak}</h3>
          <p className="text-sm text-gray-600">Gün Üst Üste Aktif</p>
        </div>
      </div>
      {streak >= 7 && (
        <div className="mt-4 rounded-md bg-orange-100 p-2 text-center text-sm font-medium text-orange-800">
          🎉 Harika gidiyorsun! Devam et!
        </div>
      )}
    </div>
  );
}
