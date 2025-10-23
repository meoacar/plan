import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CalorieTracker from '@/components/calories/CalorieTracker';

export const metadata = {
  title: 'Kalori Takibi - Zayıflama Planım',
  description: 'Günlük kalori ve besin değerlerini takip edin',
};

export default async function CaloriesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/calories');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kalori Takibi</h1>
        <p className="mt-2 text-gray-600">
          Günlük yemeklerinizi ve kalori alımınızı takip edin
        </p>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <CalorieTracker userId={session.user.id} />
      </Suspense>
    </div>
  );
}
