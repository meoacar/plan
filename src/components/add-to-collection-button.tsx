'use client';

import { useState, useEffect } from 'react';
import { FolderPlus, Check } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
}

interface AddToCollectionButtonProps {
  planId: string;
}

export function AddToCollectionButton({ planId }: AddToCollectionButtonProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showMenu) {
      fetch('/api/collections')
        .then((r) => r.json())
        .then(setCollections);
    }
  }, [showMenu]);

  const addToCollection = async (collectionId: string) => {
    setLoading(true);
    const res = await fetch(`/api/collections/${collectionId}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    setLoading(false);
    if (res.ok) {
      alert('Koleksiyona eklendi!');
      setShowMenu(false);
    } else {
      const data = await res.json();
      alert(data.error || 'Bir hata oluştu');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        title="Koleksiyona ekle"
      >
        <FolderPlus size={20} />
        <span className="hidden sm:inline">Koleksiyona Ekle</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border bg-white shadow-lg">
            <div className="max-h-64 overflow-y-auto p-2">
              {collections.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">
                  Henüz koleksiyon yok
                </p>
              ) : (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => addToCollection(collection.id)}
                    disabled={loading}
                    className="flex w-full items-center gap-2 rounded px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Check size={16} className="text-green-600" />
                    {collection.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
