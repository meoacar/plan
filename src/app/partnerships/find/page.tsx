// src/app/partnerships/find/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  startWeight: number | null;
  goalWeight: number | null;
  level: number;
  streak: number;
  _count: {
    plans: number;
  };
}

export default function FindPartnersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minWeight: '',
    maxWeight: '',
    minGoal: '',
    maxGoal: '',
  });
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    searchUsers();
  }, []);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.minWeight) params.append('minWeight', filters.minWeight);
      if (filters.maxWeight) params.append('maxWeight', filters.maxWeight);
      if (filters.minGoal) params.append('minGoal', filters.minGoal);
      if (filters.maxGoal) params.append('maxGoal', filters.maxGoal);

      const res = await fetch(`/api/partnerships/find?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPartnerRequest = async (partnerId: string) => {
    setSendingRequest(partnerId);
    try {
      const res = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });

      if (res.ok) {
        alert('Partner talebi gönderildi!');
        // Kullanıcıyı listeden kaldır
        setUsers(users.filter((u) => u.id !== partnerId));
      } else {
        const data = await res.json();
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Request error:', error);
      alert('Bir hata oluştu');
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Partner Bul</h1>
        <p className="text-gray-600">
          Hedeflerinize birlikte ulaşmak için bir partner bulun
        </p>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Kullanıcı Ara</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim veya email..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={searchUsers}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Başlangıç Kilosu (kg)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minWeight}
                onChange={(e) =>
                  setFilters({ ...filters, minWeight: e.target.value })
                }
                placeholder="Min"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                value={filters.maxWeight}
                onChange={(e) =>
                  setFilters({ ...filters, maxWeight: e.target.value })
                }
                placeholder="Max"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Hedef Kilo (kg)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minGoal}
                onChange={(e) =>
                  setFilters({ ...filters, minGoal: e.target.value })
                }
                placeholder="Min"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                value={filters.maxGoal}
                onChange={(e) =>
                  setFilters({ ...filters, maxGoal: e.target.value })
                }
                placeholder="Max"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
        </div>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <img
                  src={user.image || '/default-avatar.png'}
                  alt={user.name || 'User'}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                />
                <h3 className="font-semibold text-lg">{user.name}</h3>
                {user.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {user.startWeight && user.goalWeight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hedef:</span>
                    <span className="font-medium">
                      {user.startWeight}kg → {user.goalWeight}kg
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Seviye:</span>
                  <span className="font-medium">Level {user.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streak:</span>
                  <span className="font-medium text-orange-600">
                    🔥 {user.streak} gün
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Planlar:</span>
                  <span className="font-medium">{user._count.plans}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/profile/${user.id}`}
                  className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Profili Gör
                </Link>
                <button
                  onClick={() => sendPartnerRequest(user.id)}
                  disabled={sendingRequest === user.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
                >
                  {sendingRequest === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Talep Gönder
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Kullanıcı bulunamadı</p>
        </div>
      )}
    </div>
  );
}
