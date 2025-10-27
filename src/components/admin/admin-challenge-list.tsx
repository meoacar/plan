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

interface Group {
  id: string;
  name: string;
  slug: string;
}

export default function AdminChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEIGHT_LOSS',
    target: 0,
    unit: 'kg',
    startDate: '',
    endDate: '',
    groupId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChallenges();
    fetchGroups();
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

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/admin/groups');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Gruplar yüklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          target: Number(formData.target),
          groupId: formData.groupId || null,
        }),
      });

      if (res.ok) {
        alert('Challenge başarıyla oluşturuldu!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          type: 'WEIGHT_LOSS',
          target: 0,
          unit: 'kg',
          startDate: '',
          endDate: '',
          groupId: '',
        });
        fetchChallenges();
      } else {
        const data = await res.json();
        alert(data.error || 'Challenge oluşturulamadı');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu challenge\'ı silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/challenges/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Challenge silindi');
        fetchChallenges();
      } else {
        alert('Challenge silinemedi');
      }
    } catch (error) {
      alert('Bir hata oluştu');
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

      {/* Challenge Oluşturma Formu */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Yeni Challenge Oluştur</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Açıklama *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tip *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="WEIGHT_LOSS">Kilo Kaybı</option>
                    <option value="EXERCISE">Egzersiz</option>
                    <option value="WATER">Su İçme</option>
                    <option value="STEPS">Adım</option>
                    <option value="CUSTOM">Özel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Grup (Opsiyonel)</label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Tüm Kullanıcılar</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hedef *</label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Birim *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="kg, adım, bardak, vb."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenge Listesi */}
      <div className="grid gap-4">
        {challenges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Henüz challenge oluşturulmamış
          </div>
        ) : (
          challenges.map((challenge) => (
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
                <button
                  onClick={() => handleDelete(challenge.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
