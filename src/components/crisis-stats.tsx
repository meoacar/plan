'use client';

import { useEffect, useState } from 'react';

interface CrisisStats {
  byTrigger: Array<{ trigger: string; _count: number }>;
  resolved: number;
  total: number;
  successRate: number;
}

interface CrisisButton {
  id: string;
  trigger: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export function CrisisStats() {
  const [stats, setStats] = useState<CrisisStats | null>(null);
  const [history, setHistory] = useState<CrisisButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    
    // Her 3 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      fetchStats(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await fetch('/api/crisis-button?limit=20', {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setHistory(data.crisisButtons);
      }
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const triggerLabels: Record<string, { label: string; emoji: string; color: string }> = {
    food_craving: { label: 'Yemek İsteği', emoji: '🍕', color: 'from-orange-500 to-red-500' },
    motivation_low: { label: 'Motivasyon Düşük', emoji: '😔', color: 'from-blue-500 to-indigo-500' },
    stress_eating: { label: 'Stres', emoji: '😰', color: 'from-purple-500 to-pink-500' },
    boredom: { label: 'Can Sıkıntısı', emoji: '😴', color: 'from-gray-500 to-slate-500' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Henüz kriz anı kaydı yok.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Yenileme Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          {refreshing ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 animate-fadeIn">
          <div className="text-4xl mb-2">🆘</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-gray-600">Toplam Kriz Anı</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold text-gray-900">{stats.resolved}</div>
          <div className="text-gray-600">Atlatılan Kriz</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.successRate.toFixed(0)}%
          </div>
          <div className="text-gray-600">Başarı Oranı</div>
        </div>
      </div>

      {/* Kriz Türlerine Göre Dağılım */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          📊 Kriz Türleri Dağılımı
        </h3>
        <div className="space-y-4">
          {stats.byTrigger.map((item, index) => {
            const triggerInfo = triggerLabels[item.trigger];
            const percentage = (item._count / stats.total) * 100;

            return (
              <div
                key={item.trigger}
                className="animate-slideInLeft"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{triggerInfo.emoji}</span>
                    <span className="font-medium text-gray-900">
                      {triggerInfo.label}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {item._count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${triggerInfo.color} animate-progressBar`}
                    style={{ 
                      width: `${percentage}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Son Kriz Anları */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          📜 Son Kriz Anları
        </h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Henüz kriz anı kaydı yok.
            </p>
          ) : (
            history.map((crisis, index) => {
              const triggerInfo = triggerLabels[crisis.trigger];
              return (
                <div
                  key={crisis.id}
                  className={`p-4 rounded-lg border-2 animate-fadeIn ${
                    crisis.resolved
                      ? 'bg-green-50 border-green-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{triggerInfo.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {triggerInfo.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(crisis.createdAt).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                    <div>
                      {crisis.resolved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                          ✅ Atlatıldı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                          ⏳ Devam Ediyor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Motivasyon Mesajı */}
      {stats.successRate >= 80 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300 animate-scaleIn">

          <div className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Muhteşem Başarı!
            </h3>
            <p className="text-gray-700">
              %{stats.successRate.toFixed(0)} başarı oranıyla krizleri harika yönetiyorsun!
              Böyle devam et! 💪
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
