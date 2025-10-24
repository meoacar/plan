'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  goalType: string;
  imageUrl?: string;
  _count: {
    members: number;
    challenges: number;
  };
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalType, setGoalType] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [goalType]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (goalType) params.append('goalType', goalType);
      
      const res = await fetch(`/api/groups?${params}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Gruplar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setGoalType('')}
          className={`px-4 py-2 rounded ${
            !goalType ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setGoalType('weight-loss')}
          className={`px-4 py-2 rounded ${
            goalType === 'weight-loss' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Kilo Verme
        </button>
        <button
          onClick={() => setGoalType('fitness')}
          className={`px-4 py-2 rounded ${
            goalType === 'fitness' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Fitness
        </button>
        <button
          onClick={() => setGoalType('healthy-eating')}
          className={`px-4 py-2 rounded ${
            goalType === 'healthy-eating' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Sağlıklı Beslenme
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.slug}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            {group.imageUrl && (
              <img
                src={group.imageUrl}
                alt={group.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>👥 {group._count.members} üye</span>
                <span>🏆 {group._count.challenges} challenge</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Henüz grup bulunmuyor
        </div>
      )}
    </div>
  );
}
