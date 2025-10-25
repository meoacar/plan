import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const dynamic = 'force-dynamic';

type MetricGroup = {
  metricName: string;
  rating: string;
  _avg: { value: number | null };
  _count: number;
};

type RecentMetric = {
  metricName: string;
  value: number;
  rating: string;
  createdAt: Date;
  url: string;
};

async function getWebVitalsStats() {
  // WebVitals tablosu henüz oluşturulmadı
  // create-web-vitals-table.sql dosyasını çalıştırın
  return { 
    metrics: [] as MetricGroup[], 
    recentMetrics: [] as RecentMetric[] 
  };
}

function getRatingColor(rating: string) {
  switch (rating) {
    case 'good':
      return 'text-green-600 bg-green-50';
    case 'needs-improvement':
      return 'text-yellow-600 bg-yellow-50';
    case 'poor':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

function formatMetricValue(name: string, value: number) {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

export default async function WebVitalsPage() {
  const { metrics, recentMetrics } = await getWebVitalsStats();

  // Tablo henüz oluşturulmadıysa uyarı göster
  if (metrics.length === 0 && recentMetrics.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Web Vitals Tablosu Henüz Oluşturulmadı</CardTitle>
            <CardDescription>
              Performans izleme sistemini aktif hale getirmek için aşağıdaki adımları takip edin:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Kurulum Adımları:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
                <li>Veritabanı yönetim aracınızı açın (pgAdmin, DBeaver, vb.)</li>
                <li><code className="bg-yellow-100 px-2 py-1 rounded">create-web-vitals-table.sql</code> dosyasını bulun</li>
                <li>SQL komutlarını veritabanınızda çalıştırın</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Alternatif: Prisma Migrate</h3>
              <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
                <code>npx prisma migrate dev --name add_web_vitals</code>
              </pre>
              <p className="text-sm text-blue-700 mt-2">
                Not: Bu komut migration history'yi güncelleyecektir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Metrik isimlerine göre grupla
  const metricsByName = metrics.reduce(
    (acc: Record<string, MetricGroup[]>, metric: MetricGroup) => {
      if (!acc[metric.metricName]) {
        acc[metric.metricName] = [];
      }
      acc[metric.metricName].push(metric);
      return acc;
    },
    {} as Record<string, MetricGroup[]>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Web Vitals Metrikleri</h1>
        <p className="text-gray-600 mt-2">
          Son 7 günün gerçek kullanıcı performans verileri
        </p>
      </div>

      {/* Metrik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(metricsByName).map(([metricName, metricData]) => {
          const totalCount = metricData.reduce(
            (sum: number, m: MetricGroup) => sum + m._count,
            0
          );
          const avgValue =
            metricData.reduce(
              (sum: number, m: MetricGroup) =>
                sum + (m._avg.value || 0) * m._count,
              0
            ) / totalCount;

          const goodCount =
            metricData.find((m: MetricGroup) => m.rating === 'good')?._count ||
            0;
          const needsImprovementCount =
            metricData.find(
              (m: MetricGroup) => m.rating === 'needs-improvement'
            )?._count || 0;
          const poorCount =
            metricData.find((m: MetricGroup) => m.rating === 'poor')?._count ||
            0;

          const goodPercentage = ((goodCount / totalCount) * 100).toFixed(1);

          return (
            <Card key={metricName}>
              <CardHeader>
                <CardTitle className="text-lg">{metricName}</CardTitle>
                <CardDescription>
                  Ortalama: {formatMetricValue(metricName, avgValue)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">İyi</span>
                    <span className="text-sm font-semibold text-green-600">
                      {goodCount} ({goodPercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Orta</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {needsImprovementCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kötü</span>
                    <span className="text-sm font-semibold text-red-600">
                      {poorCount}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Toplam ölçüm: {totalCount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Son Metrikler Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Son Ölçümler</CardTitle>
          <CardDescription>En son 100 metrik ölçümü</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Metrik</th>
                  <th className="text-left p-2">Değer</th>
                  <th className="text-left p-2">Durum</th>
                  <th className="text-left p-2">Sayfa</th>
                  <th className="text-left p-2">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentMetrics.map((metric: RecentMetric, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{metric.metricName}</td>
                    <td className="p-2">
                      {formatMetricValue(metric.metricName, metric.value)}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(metric.rating)}`}
                      >
                        {metric.rating}
                      </span>
                    </td>
                    <td className="p-2 text-xs text-gray-600 max-w-xs truncate">
                      {metric.url}
                    </td>
                    <td className="p-2 text-xs text-gray-600">
                      {new Date(metric.createdAt).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Metrik Açıklamaları */}
      <Card>
        <CardHeader>
          <CardTitle>Metrik Açıklamaları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">FCP (First Contentful Paint)</h3>
              <p className="text-gray-600">
                İlk içeriğin ekranda görünme süresi. İyi: &lt;1.8s
              </p>
            </div>
            <div>
              <h3 className="font-semibold">LCP (Largest Contentful Paint)</h3>
              <p className="text-gray-600">
                En büyük içeriğin yüklenme süresi. İyi: &lt;2.5s
              </p>
            </div>
            <div>
              <h3 className="font-semibold">FID (First Input Delay)</h3>
              <p className="text-gray-600">
                İlk etkileşime yanıt süresi. İyi: &lt;100ms
              </p>
            </div>
            <div>
              <h3 className="font-semibold">CLS (Cumulative Layout Shift)</h3>
              <p className="text-gray-600">
                Görsel kararlılık skoru. İyi: &lt;0.1
              </p>
            </div>
            <div>
              <h3 className="font-semibold">TTFB (Time to First Byte)</h3>
              <p className="text-gray-600">
                İlk byte'ın gelme süresi. İyi: &lt;800ms
              </p>
            </div>
            <div>
              <h3 className="font-semibold">INP (Interaction to Next Paint)</h3>
              <p className="text-gray-600">
                Etkileşimden sonraki görsel güncelleme süresi. İyi: &lt;200ms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
