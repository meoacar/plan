'use client';

import { useState, useEffect } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  group?: {
    name: string;
    slug: string;
  };
  _count: {
    participants: number;
  };
}

export default function AdminChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/challenges');
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Challenge\'lar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Challenge Yönetimi</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Yeni Challenge
        </button>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{challenge.title}</h3>
                  {challenge.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{challenge.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Tip: {challenge.type}</span>
                  <span>Hedef: {challenge.target} {challenge.unit}</span>
                  <span>Katılımcı: {challenge._count.participants}</span>
                  {challenge.group && <span>Grup: {challenge.group.name}</span>}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(challenge.startDate).toLocaleDateString('tr-TR')} -{' '}
                  {new Date(challenge.endDate).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
