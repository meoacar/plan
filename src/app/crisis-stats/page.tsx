import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CrisisStats } from '@/components/crisis-stats';

export const metadata = {
  title: 'Kriz Anı İstatistikleri - Zayıflama Planım',
  description: 'Kriz anlarını yönetme başarınızı takip edin',
};

export default async function CrisisStatsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🆘 Kriz Anı İstatistikleri
        </h1>
        <p className="text-gray-600 text-lg">
          Kriz anlarını nasıl yönettiğini gör ve kendini geliştir!
        </p>
      </div>

      <CrisisStats />

      {/* Bilgilendirme Kartı */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          💡 Kriz Anı Butonu Nedir?
        </h3>
        <p className="text-gray-700 mb-4">
          Zayıflama yolculuğunda zorlu anlar yaşadığında, sağ alttaki "🆘 Kriz Anı!" 
          butonuna tıklayarak anında motivasyon desteği alabilirsin. Bu özellik:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Yemek isteği, stres veya motivasyon düşüklüğü gibi kriz anlarında sana destek olur</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Güçlü motivasyon mesajları ve pratik önerilerle krizi atlatmanı sağlar</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Her atlatılan kriz için XP kazanırsın ve seviye atlarsın</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Kriz anlarını takip ederek hangi durumlarda zorlandığını görebilirsin</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
