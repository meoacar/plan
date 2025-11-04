import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBalance } from '@/lib/coin-system';
import CoinBalance from '@/components/coins/CoinBalance';
import CoinStats from '@/components/coins/CoinStats';
import CoinTransactionHistory from '@/components/coins/CoinTransactionHistory';
import { Coins, TrendingUp, History } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Coinlerim | Zayıflama Planım',
  description: 'Coin bakiyenizi ve işlem geçmişinizi görüntüleyin',
};

export default async function CoinsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Coin bakiyesini al
  const coins = await getBalance(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Coinlerim
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Coin bakiyenizi ve işlem geçmişinizi görüntüleyin
            </p>
          </div>
        </div>
      </div>

      {/* Coin Bakiyesi */}
      <div className="mb-8 flex justify-center">
        <CoinBalance coins={coins} size="lg" showAnimation={true} />
      </div>

      {/* İstatistikler */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            İstatistikler
          </h2>
        </div>
        <CoinStats defaultPeriod="all" />
      </div>

      {/* İşlem Geçmişi */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            İşlem Geçmişi
          </h2>
        </div>
        <CoinTransactionHistory showFilters={true} limit={20} />
      </div>
    </div>
  );
}
