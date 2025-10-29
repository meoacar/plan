'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

interface PartnershipActionsProps {
  partnershipId: string;
}

export default function PartnershipActions({ partnershipId }: PartnershipActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: 'ACTIVE' | 'REJECTED') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/partnerships/${partnershipId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        // Sayfayı yenile ve cache'i temizle
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Partnership action error:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => handleAction('ACTIVE')}
        disabled={loading}
        className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-4 h-4" />
        Kabul Et
      </button>
      <button
        onClick={() => handleAction('REJECTED')}
        disabled={loading}
        className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircle className="w-4 h-4" />
        Reddet
      </button>
    </div>
  );
}
