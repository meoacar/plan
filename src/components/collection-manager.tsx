'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, Unlock } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  _count: { plans: number };
  plans: { plan: { id: string; title: string; imageUrl: string | null } }[];
}

export function CollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const loadCollections = async () => {
    const res = await fetch('/api/collections');
    if (res.ok) setCollections(await res.json());
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const createCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, isPublic }),
    });
    if (res.ok) {
      setName('');
      setDescription('');
      setIsPublic(false);
      setShowForm(false);
      loadCollections();
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm('Bu koleksiyonu silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (res.ok) loadCollections();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Koleksiyonlarım</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          <Plus size={20} />
          Yeni Koleksiyon
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCollection} className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">İsim</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Herkese açık
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Oluştur
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <div key={collection.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{collection.name}</h3>
                <p className="text-sm text-gray-600">{collection._count.plans} plan</p>
              </div>
              <div className="flex gap-2">
                {collection.isPublic ? (
                  <Unlock size={16} className="text-green-600" />
                ) : (
                  <Lock size={16} className="text-gray-400" />
                )}
                <button
                  onClick={() => deleteCollection(collection.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {collection.description && (
              <p className="mb-3 text-sm text-gray-600">{collection.description}</p>
            )}
            <div className="flex gap-2">
              {collection.plans.slice(0, 3).map((cp) => (
                <div key={cp.plan.id} className="h-16 w-16 overflow-hidden rounded bg-gray-100">
                  {cp.plan.imageUrl && (
                    <img
                      src={cp.plan.imageUrl}
                      alt={cp.plan.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
