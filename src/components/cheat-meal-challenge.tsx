"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Challenge {
  id: string;
  limit: number;
  penalty?: string;
  weekStart: string;
  weekEnd: string;
}

interface ChallengeData {
  challenge: Challenge | null;
  cheatCount: number;
  exceeded: boolean;
}

export default function CheatMealChallenge() {
  const { data: session } = useSession();
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [limit, setLimit] = useState(2);
  const [penalty, setPenalty] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchChallenge();
    }
  }, [session]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch("/api/cheat-meals/challenge");
      const data = await res.json();
      setChallengeData(data);
    } catch (error) {
      console.error("Error fetching challenge:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cheat-meals/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, penalty }),
      });

      if (res.ok) {
        setShowForm(false);
        fetchChallenge();
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  const hasChallenge = challengeData?.challenge;
  const cheatCount = challengeData?.cheatCount || 0;
  const challengeLimit = challengeData?.challenge?.limit || 0;
  const exceeded = challengeData?.exceeded || false;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🎯 Haftalık Challenge
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Kendine bir limit koy, aşarsan ceza!
          </p>
        </div>
        {!hasChallenge && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
          >
            Challenge Oluştur
          </button>
        )}
      </div>

      {hasChallenge ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">
                {cheatCount} / {challengeLimit} kaçamak
              </span>
              <span className={exceeded ? "text-red-600 font-bold" : "text-green-600"}>
                {exceeded ? "Limit aşıldı! 😱" : "Devam et! 💪"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  exceeded
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
                style={{ width: `${Math.min((cheatCount / challengeLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Ceza Bilgisi */}
          {challengeData?.challenge?.penalty && (
            <div className={`p-4 rounded-lg ${exceeded ? "bg-red-100 border-2 border-red-300" : "bg-purple-100 border border-purple-200"}`}>
              <div className="flex items-start gap-2">
                <span className="text-2xl">{exceeded ? "⚠️" : "📝"}</span>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">
                    {exceeded ? "Ceza Zamanı!" : "Ceza:"}
                  </div>
                  <p className="text-sm text-gray-700">{challengeData.challenge.penalty}</p>
                </div>
              </div>
            </div>
          )}

          {/* Motivasyon Mesajı */}
          <div className="bg-white rounded-lg p-4 text-center">
            {exceeded ? (
              <div>
                <div className="text-4xl mb-2">😅</div>
                <p className="text-sm text-gray-700">
                  Tamam, aştın. Ama haftaya daha iyisini yaparsın! 💪
                </p>
              </div>
            ) : cheatCount === 0 ? (
              <div>
                <div className="text-4xl mb-2">🌟</div>
                <p className="text-sm text-gray-700">
                  Mükemmel gidiyorsun! Hiç kaçamak yok! 🎉
                </p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">👍</div>
                <p className="text-sm text-gray-700">
                  İyi gidiyorsun! {challengeLimit - cheatCount} hakkın kaldı.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-gray-600 mb-4">
            Henüz bir challenge oluşturmadın.
            <br />
            Kendine bir hedef koy ve takip et!
          </p>
        </div>
      )}

      {/* Challenge Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🎯 Haftalık Challenge Oluştur
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bu hafta kaç kaçamak hakkın var?
                </label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl font-bold"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Önerilen: 2 kaçamak
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aşarsan ceza ne olsun? 😜
                </label>
                <textarea
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  placeholder="Örnek: 10 squat yap, selfie gönder 📸"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 font-semibold"
              >
                {loading ? "Oluşturuluyor..." : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
