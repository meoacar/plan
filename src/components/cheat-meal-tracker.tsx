"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CHEAT_TYPES = [
  { value: "SWEET", label: "🍰 Tatlı", emoji: "🍰", message: "Tatlı da haklı… ama sen daha haklısın 🍫" },
  { value: "FAST_FOOD", label: "🍟 Fast food", emoji: "🍟", message: "Bu seferlik saymıyoruz, ama patates kızartması seni izliyor 👀" },
  { value: "SODA", label: "🥤 Gazlı içecek", emoji: "🥤", message: "Köpük değil motivasyon patlasın 🥂" },
  { value: "ALCOHOL", label: "🍺 Alkol", emoji: "🍺", message: "Bir yudum keyif, ama suyla barış imzala 💧" },
  { value: "OTHER", label: "🌮 Diğer", emoji: "🌮", message: "Kaydettik, ama yargılamıyoruz 😉" },
];

interface CheatMeal {
  id: string;
  type: string;
  note?: string;
  date: string;
}

interface Stats {
  type: string;
  _count: number;
}

export default function CheatMealTracker() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [cheatMeals, setCheatMeals] = useState<CheatMeal[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<"week" | "month">("week");

  useEffect(() => {
    if (session?.user) {
      fetchCheatMeals();
    }
  }, [session]);

  const fetchCheatMeals = async () => {
    try {
      const res = await fetch(`/api/cheat-meals?period=${period}`);
      const data = await res.json();
      setCheatMeals(data.cheatMeals || []);
      setStats(data.stats || []);
    } catch (error) {
      console.error("Error fetching cheat meals:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCheatMeals();
    }
  }, [period]);

  const handleSubmit = async () => {
    if (!selectedType) return;

    setLoading(true);
    try {
      const res = await fetch("/api/cheat-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, note }),
      });

      if (res.ok) {
        const cheatType = CHEAT_TYPES.find((t) => t.value === selectedType);
        setMessage(cheatType?.message || "");
        setTimeout(() => {
          setShowModal(false);
          setMessage("");
          setSelectedType("");
          setNote("");
          fetchCheatMeals();
        }, 3000);
      }
    } catch (error) {
      console.error("Error adding cheat meal:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCheats = () => {
    return stats.reduce((sum, s) => sum + s._count, 0);
  };

  const getHealthyDays = () => {
    const totalDays = period === "week" ? 7 : 30;
    return totalDays - new Set(cheatMeals.map((c) => new Date(c.date).toDateString())).size;
  };

  const getConscienceBar = () => {
    const totalCheats = getTotalCheats();
    if (totalCheats === 0) return 0;
    if (totalCheats <= 2) return 25;
    if (totalCheats <= 4) return 50;
    if (totalCheats <= 6) return 75;
    return 100;
  };

  if (!session?.user) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 shadow-lg border-2 border-orange-200">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            😈 Yemek Günah Sayacı
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Kaçamak mı, sadece keyif mi? Sen karar ver!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === "week"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Bu Hafta
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === "month"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Bu Ay
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
          >
            + Kaçamak Ekle
          </button>
        </div>
      </div>

      {/* Haftalık Özet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-orange-600">{getTotalCheats()}</div>
          <div className="text-sm text-gray-600">Bu hafta kaçamak</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-green-600">{getHealthyDays()}</div>
          <div className="text-sm text-gray-600">Sağlıklı gün 💪</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-purple-600">+{getHealthyDays() * 2}</div>
          <div className="text-sm text-gray-600">Melek puanı 👼</div>
        </div>
      </div>

      {/* Vicdan Barı */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">😇 Vicdan Barı</span>
          <span className="text-xs text-gray-500">
            {getTotalCheats() === 0
              ? "Tertemiz! 🌟"
              : getTotalCheats() <= 2
              ? "İyi durumda 👍"
              : getTotalCheats() <= 4
              ? "Biraz doldu 😅"
              : "Epey doldu! 😰"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              getConscienceBar() <= 25
                ? "bg-gradient-to-r from-green-400 to-green-500"
                : getConscienceBar() <= 50
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                : getConscienceBar() <= 75
                ? "bg-gradient-to-r from-orange-400 to-orange-500"
                : "bg-gradient-to-r from-red-400 to-red-500"
            }`}
            style={{ width: `${getConscienceBar()}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {getTotalCheats() > 0 && "XP'n sabit kaldı, ama vicdan barın biraz doldu 😂"}
        </p>
      </div>

      {/* İstatistikler */}
      {stats.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">Bu Haftanın Dağılımı</h3>
          <div className="space-y-2">
            {stats.map((stat) => {
              const cheatType = CHEAT_TYPES.find((t) => t.value === stat.type);
              return (
                <div key={stat.type} className="flex items-center justify-between">
                  <span className="text-2xl">{cheatType?.emoji}</span>
                  <span className="text-sm text-gray-600 flex-1 ml-2">{cheatType?.label}</span>
                  <span className="font-bold text-orange-600">{stat._count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {message ? (
              <div className="text-center">
                <div className="text-6xl mb-4">😈</div>
                <p className="text-xl font-semibold text-gray-800">{message}</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  Ne günah işledin bugün? 😈
                </h3>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Yargılamıyoruz, sadece farkındalık yaratıyoruz 😊
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {CHEAT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedType === type.value
                          ? "border-orange-500 bg-orange-50 shadow-md"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="text-3xl mb-1">{type.emoji}</div>
                      <div className="text-sm font-medium text-gray-700">
                        {type.label.split(" ")[1]}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedType === "OTHER" && (
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ne yedin? (örn: Pizza, Hamburger...)"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm font-medium"
                    required
                  />
                )}

                {selectedType !== "OTHER" && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Not ekle (isteğe bağlı): 'Doğum günüydü yaa' 🎂"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm"
                    rows={2}
                  />
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedType("");
                      setNote("");
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedType || loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
