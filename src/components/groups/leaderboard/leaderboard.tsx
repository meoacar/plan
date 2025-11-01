import { auth } from '@/lib/auth';
import { getLeaderboard, getUserLeaderboardPosition } from '@/lib/group-leaderboard';
import { LeaderboardCard } from './leaderboard-card';
import { Trophy, AlertCircle } from 'lucide-react';

type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

interface LeaderboardProps {
  groupId: string;
  period?: LeaderboardPeriod;
  limit?: number;
}

export async function Leaderboard({
  groupId,
  period = 'WEEKLY',
  limit = 50,
}: LeaderboardProps) {
  const session = await auth();

  try {
    // Liderlik tablosunu getir
    const leaderboard = await getLeaderboard(groupId, period, limit);

    // Kullanıcının pozisyonunu getir
    const userPosition = session?.user?.id
      ? await getUserLeaderboardPosition(session.user.id, groupId, period)
      : null;

    if (leaderboard.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz Veri Yok
          </h3>
          <p className="text-gray-600">
            Liderlik tablosu için henüz yeterli aktivite bulunmuyor. Paylaşım yaparak,
            yorum bırakarak ve aktif olarak sıralamaya girebilirsiniz!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Liderlik Tablosu Başlığı */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Liderlik Tablosu</h2>
              <p className="text-sm text-gray-600">
                {period === 'WEEKLY' && 'Bu haftanın en aktif üyeleri'}
                {period === 'MONTHLY' && 'Bu ayın en aktif üyeleri'}
                {period === 'ALL_TIME' && 'Tüm zamanların en aktif üyeleri'}
              </p>
            </div>
          </div>
        </div>

        {/* Kullanıcının Pozisyonu (Eğer ilk 10'da değilse) */}
        {userPosition && userPosition.rank && userPosition.rank > 10 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Sizin Pozisyonunuz
            </h3>
            <LeaderboardCard
              entry={userPosition}
              currentUserId={session?.user?.id}
            />
          </div>
        )}

        {/* Liderlik Tablosu Listesi */}
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <LeaderboardCard
              key={entry.id}
              entry={entry}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>

        {/* Bilgilendirme */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">
            Puan Nasıl Hesaplanır?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Aktivite Skoru:</strong> Paylaşım (10p), Yorum (5p), Beğeni (2p), Mesaj (1p)</li>
            <li>• <strong>Kilo Kaybı Skoru:</strong> Kaybedilen kilo × 100</li>
            <li>• <strong>Streak Skoru:</strong> Ardışık aktif günler × 5</li>
            <li>• <strong>Toplam:</strong> (Aktivite × 0.3) + (Kilo Kaybı × 0.5) + (Streak × 0.2)</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Liderlik tablosu yükleme hatası:', error);
    return (
      <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Hata Oluştu</h3>
        <p className="text-red-700">
          Liderlik tablosu yüklenirken bir hata oluştu. Lütfen daha sonra tekrar
          deneyin.
        </p>
      </div>
    );
  }
}
