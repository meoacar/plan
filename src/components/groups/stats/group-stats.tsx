import { prisma } from '@/lib/prisma';
import { Users, TrendingDown, MessageSquare, FileText, Activity } from 'lucide-react';
import { StatsCard } from './stats-card';
import { StatsChart } from './stats-chart';
import { ProgressGraph } from './progress-graph';
import { getRecentStatsHistory } from '@/lib/group-stats';

interface GroupStatsProps {
  groupId: string;
  days?: number;
}

export async function GroupStats({ groupId, days = 30 }: GroupStatsProps) {
  // Güncel istatistikleri getir
  const stats = await prisma.groupStats.findUnique({
    where: { 
      groupId 
    },
  });

  // Geçmiş verileri getir
  const history = await getRecentStatsHistory(groupId, days);

  if (!stats) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">
          Henüz istatistik verisi bulunmuyor. Lütfen daha sonra tekrar kontrol edin.
        </p>
      </div>
    );
  }

  // Grafik verileri hazırla
  const weightLossData = history.map((h: any) => ({
    date: h.date.toISOString(),
    value: h.totalWeightLoss,
  }));

  const activityData = history.map((h: any) => ({
    date: h.date.toISOString(),
    activeMembers: h.activeMembers,
    postsCount: h.postsCount,
    messagesCount: h.messagesCount,
  }));

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Toplam Üye"
          value={stats.totalMembers}
          icon={Users}
          description={`${stats.activeMembers} aktif üye`}
          color="blue"
        />
        <StatsCard
          title="Toplam Kilo Kaybı"
          value={`${stats.totalWeightLoss} kg`}
          icon={TrendingDown}
          description={`Ortalama: ${stats.avgWeightLoss} kg`}
          color="green"
        />
        <StatsCard
          title="Toplam Gönderi"
          value={stats.totalPosts}
          icon={FileText}
          description="Grup paylaşımları"
          color="purple"
        />
        <StatsCard
          title="Toplam Mesaj"
          value={stats.totalMessages}
          icon={MessageSquare}
          description="Sohbet mesajları"
          color="orange"
        />
      </div>

      {/* Aktiflik Oranı */}
      <div className="grid gap-4 md:grid-cols-1">
        <StatsCard
          title="Aktiflik Oranı"
          value={`%${stats.activeRate}`}
          icon={Activity}
          description="Son 7 gün içinde aktif olan üyeler"
          color="blue"
        />
      </div>

      {/* Grafikler */}
      {history.length > 0 && (
        <>
          <ProgressGraph
            data={weightLossData}
            title="Toplam Kilo Kaybı Trendi"
            color="#10b981"
            unit=" kg"
          />

          <StatsChart
            data={activityData}
            title="Grup Aktivitesi"
            dataKeys={[
              { key: 'activeMembers', name: 'Aktif Üyeler', color: '#3b82f6' },
              { key: 'postsCount', name: 'Gönderiler', color: '#8b5cf6' },
              { key: 'messagesCount', name: 'Mesajlar', color: '#f59e0b' },
            ]}
          />
        </>
      )}

      {/* Son Güncelleme */}
      <div className="text-center text-sm text-gray-500">
        Son güncelleme:{' '}
        {new Date(stats.lastCalculated).toLocaleString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}
