'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RewardShop from '@/components/shop/RewardShop';
import MyRewards from '@/components/shop/MyRewards';
import CoinBalance from '@/components/coins/CoinBalance';
import { Card } from '@/components/ui/card';
import {
  Store,
  Package,
  Sparkles,
  TrendingUp,
  Gift,
  ShoppingBag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ShopClientProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    coins: number;
  };
  initialRewards: any[];
  ownedRewardIds: string[];
  userRewards: any[];
}

export function ShopClient({
  user,
  initialRewards,
  ownedRewardIds,
  userRewards,
}: ShopClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('shop');
  const [coins, setCoins] = useState(user.coins);

  // Satın alma sonrası coin güncelleme
  const handlePurchaseSuccess = (remainingCoins: number) => {
    setCoins(remainingCoins);
    router.refresh();
  };

  // İstatistikler
  const stats = {
    totalRewards: initialRewards.length,
    ownedRewards: ownedRewardIds.length,
    activeRewards: userRewards.filter((r) => r.isActive).length,
    totalCoins: coins,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Başlık ve Coin Bakiyesi */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Store className="w-8 h-8 text-white" />
            </div>
            Mağaza
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Coinlerinle harika ödüller satın al ve koleksiyonunu oluştur!
          </p>
        </div>

        <CoinBalance coins={coins} showAnimation={true} size="lg" />
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Store}
          label="Mağazadaki Ödüller"
          value={stats.totalRewards}
          color="purple"
        />
        <StatCard
          icon={Package}
          label="Sahip Olduğun"
          value={stats.ownedRewards}
          color="blue"
        />
        <StatCard
          icon={Sparkles}
          label="Aktif Ödüller"
          value={stats.activeRewards}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Toplam Coin"
          value={stats.totalCoins}
          color="orange"
        />
      </div>

      {/* Ana Sekmeler */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="shop" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Mağaza</span>
              </TabsTrigger>
              <TabsTrigger value="my-rewards" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Ödüllerim</span>
                {stats.activeRewards > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                    {stats.activeRewards}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Mağaza Sekmesi */}
            <TabsContent value="shop">
              <RewardShop
                initialRewards={initialRewards}
                initialUserCoins={coins}
                ownedRewardIds={ownedRewardIds}
              />
            </TabsContent>

            {/* Ödüllerim Sekmesi */}
            <TabsContent value="my-rewards">
              <MyRewards initialRewards={userRewards} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

/**
 * İstatistik Kartı
 */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </Card>
  );
}
