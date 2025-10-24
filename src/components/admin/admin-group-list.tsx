'use client';

import { useState, useEffect } from 'react';

interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  goalType: string;
  status: string;
  createdAt: string;
  _count: {
    members: number;
    challenges: number;
    posts: number;
  };
}

export default function AdminGroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PENDING');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [status]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/groups?status=${status}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Gruplar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (groupId: string) => {
    if (!confirm('Bu grubu onaylamak istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (res.ok) {
        alert('Grup onaylandı');
        fetchGroups();
      } else {
        alert('Grup onaylanamadı');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  const handleReject = async (groupId: string) => {
    if (!rejectionReason.trim()) {
      alert('Lütfen red nedeni girin');
      return;
    }

    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason,
        }),
      });

      if (res.ok) {
        alert('Grup reddedildi');
        setSelectedGroup(null);
        setRejectionReason('');
        fetchGroups();
      } else {
        alert('Grup reddedilemedi');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Bu grubu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) return;

    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Grup silindi');
        fetchGroups();
      } else {
        alert('Grup silinemedi');
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
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setStatus('PENDING')}
          className={`px-4 py-2 rounded ${
            status === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-gray-200'
          }`}
        >
          Bekleyen ({groups.length})
        </button>
        <button
          onClick={() => setStatus('APPROVED')}
          className={`px-4 py-2 rounded ${
            status === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
        >
          Onaylanan
        </button>
        <button
          onClick={() => setStatus('REJECTED')}
          className={`px-4 py-2 rounded ${
            status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-gray-200'
          }`}
        >
          Reddedilen
        </button>
        <button
          onClick={() => setStatus('ALL')}
          className={`px-4 py-2 rounded ${
            status === 'ALL' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Tümü
        </button>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Hedef: {group.goalType}</span>
                  <span>Üye: {group._count.members}</span>
                  <span>Challenge: {group._count.challenges}</span>
                  <span>Gönderi: {group._count.posts}</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Oluşturulma: {new Date(group.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>

              <div className="flex gap-2">
                {group.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(group.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => setSelectedGroup(group)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reddet
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(group.id)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Grubu Reddet</h3>
            <p className="mb-4">Grup: {selectedGroup.name}</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Red nedeni..."
              className="w-full p-3 border rounded mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(selectedGroup.id)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reddet
              </button>
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
