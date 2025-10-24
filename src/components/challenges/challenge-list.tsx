'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  group?: {
    name: string;
    slug: string;
  };
  _count: {
    participants: number;
  };
}

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/challenges?active=true');
      const data = await res.json();
      setChallenges(data || []);
    } catch (error) {
      console.error('Challenge\'lar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Challenge\'a katıldınız!');
        fetchChallenges();
      } else {
        const data = await res.json();
        alert(data.error || 'Katılım başarısız');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challenges.map((challenge) => (
        <div key={challenge.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
          <p className="text-gray-600 mb-4">{challenge.description}</p>
          
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <div>🎯 Hedef: {challenge.target} {challenge.unit}</div>
            <div>👥 {challenge._count.participants} katılımcı</div>
            <div>
              📅 {new Date(challenge.startDate).toLocaleDateString('tr-TR')} -{' '}
              {new Date(challenge.endDate).toLocaleDateString('tr-TR')}
            </div>
            {challenge.group && (
              <div>
                🏠 Grup:{' '}
                <Link
                  href={`/groups/${challenge.group.slug}`}
                  className="text-blue-500 hover:underline"
                >
                  {challenge.group.name}
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => handleJoin(challenge.id)}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Katıl
          </button>
        </div>
      ))}

      {challenges.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          Aktif challenge bulunmuyor
        </div>
      )}
    </div>
  );
}
