'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitCompare } from 'lucide-react';

export function CompareSelector() {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const router = useRouter();

  const togglePlan = (planId: string) => {
    setSelectedPlans((prev) => {
      if (prev.includes(planId)) {
        return prev.filter((id) => id !== planId);
      }
      if (prev.length >= 3) {
        alert('En fazla 3 plan seçebilirsiniz');
        return prev;
      }
      return [...prev, planId];
    });
  };

  const handleCompare = () => {
    if (selectedPlans.length < 2) {
      alert('En az 2 plan seçmelisiniz');
      return;
    }
    router.push(`/compare?ids=${selectedPlans.join(',')}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {selectedPlans.length > 0 && (
        <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="font-bold">{selectedPlans.length} plan seçildi</span>
            {selectedPlans.length >= 2 && (
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-purple-600 hover:bg-gray-100"
              >
                <GitCompare size={16} />
                Karşılaştır
              </button>
            )}
            <button
              onClick={() => setSelectedPlans([])}
              className="text-sm underline hover:text-gray-200"
            >
              Temizle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
