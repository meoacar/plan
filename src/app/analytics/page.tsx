import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TurkeyWeightMap } from '@/components/analytics/turkey-weight-map';
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap';
import { UserTimeline } from '@/components/analytics/user-timeline';
import { ComparisonChart } from '@/components/analytics/comparison-chart';
import { SuccessPredictor } from '@/components/analytics/success-predictor';

export const metadata: Metadata = {
  title: 'Analitik & Görselleştirme | Zayıflama Planım',
  description: 'Verilerinizi görselleştirin ve ilerlemenizi takip edin',
};

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📊 Analitik & Görselleştirme</h1>
        <p className="text-gray-600">
          Verilerinizi görselleştirin, ilerlemenizi takip edin ve başarınızı ölçün
        </p>
      </div>

      <div className="space-y-8">
        {/* Başarı Tahmini */}
        <SuccessPredictor userId={session.user.id} />

        {/* Karşılaştırma Grafiği */}
        <ComparisonChart userId={session.user.id} />

        {/* Zaman Tüneli */}
        <UserTimeline userId={session.user.id} />

        {/* Türkiye Kilo Haritası */}
        <TurkeyWeightMap />

        {/* Aktivite Haritası */}
        <ActivityHeatmap />
      </div>
    </div>
  );
}
