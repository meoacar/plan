'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Plan {
  id: string;
  title: string;
  slug: string;
  startWeight: number;
  goalWeight: number;
  durationText: string;
  motivation: string;
  imageUrl?: string;
  videoUrl?: string;
  user: { name: string | null; image: string | null };
  category: { name: string } | null;
  tags: { tag: { name: string } }[];
  _count: { likes: number; comments: number; favorites: number };
}

interface PlanCompareProps {
  planIds: string[];
}

export function PlanCompare({ planIds }: PlanCompareProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/plans/compare?ids=${planIds.join(',')}`)
      .then((r) => r.json())
      .then(setPlans)
      .finally(() => setLoading(false));
  }, [planIds]);

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-4 text-left font-semibold">Özellik</th>
            {plans.map((plan) => (
              <th key={plan.id} className="border p-4 text-left">
                <Link href={`/plan/${plan.slug}`} className="hover:text-green-600">
                  {plan.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-4 font-medium">Görsel</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4">
                {plan.imageUrl && (
                  <Image
                    src={plan.imageUrl}
                    alt={plan.title}
                    width={200}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Başlangıç Kilo</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4">{plan.startWeight} kg</td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Hedef Kilo</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4">{plan.goalWeight} kg</td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Kilo Kaybı</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4 font-bold text-green-600">
                {plan.startWeight - plan.goalWeight} kg
              </td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Süre</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4">{plan.durationText}</td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Kategori</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4">
                {plan.category?.name || 'Genel'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Beğeni</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4">❤️ {plan._count.likes}</td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Yorum</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4">💬 {plan._count.comments}</td>
            ))}
          </tr>
          <tr>
            <td className="border p-4 font-medium">Motivasyon</td>
            {plans.map((plan) => (
              <td key={plan.id} className="border p-4 text-sm">{plan.motivation}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
