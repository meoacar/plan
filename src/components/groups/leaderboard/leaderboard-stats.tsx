'use client';

import { Trophy, Users, TrendingUp, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number | null;
  activityScore: number;
  weightLossScore: number;
  streakScore: number;
  totalScore: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

interface LeaderboardStatsProps {
  leaderboard: LeaderboardEntry[];
  userPosition?: LeaderboardEntry | null;
}

export function LeaderboardStats({
  leaderboard,
  userPosition,
}: LeaderboardStatsProps) {
  // İstatistikleri hesapla
  const totalParticipants = leaderboard.length;
  const averageScore =
    leaderboard.reduce((sum, entry) => sum + entry.totalScore, 0) /
    (totalParticipants || 1);

  const topScore = leaderboard[0]?.totalScore || 0;
  const userRank = userPosition?.rank || 0;

  // Kullanıcının yüzdelik dilimi
  const percentile = userRank > 0 
    ? Math.round(((totalParticipants - userRank + 1) / totalParticipants) * 100)
    : 0;

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Toplam Katılımcı',
      value: totalParticipants,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      label: 'En Yüksek Skor',
      value: topScore.toFixed(0),
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Ortalama Skor',
      value: averageScore.toFixed(0),
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'Sizin Sıranız',
      value: userRank > 0 ? `#${userRank}` : '-',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-4">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Kullanıcı Performans Özeti */}
      {userPosition && userRank > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg shadow-sm border border-primary-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" />
            Sizin Performansınız
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Sıralama</div>
              <div className="text-xl font-bold text-primary-600">
                #{userRank}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Yüzdelik Dilim</div>
              <div className="text-xl font-bold text-green-600">
                Top {percentile}%
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Toplam Puan</div>
              <div className="text-xl font-bold text-purple-600">
                {userPosition.totalScore.toFixed(0)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Liderle Fark</div>
              <div className="text-xl font-bold text-orange-600">
                {(topScore - userPosition.totalScore).toFixed(0)}
              </div>
            </div>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Lider Skoruna Göre</span>
              <span>
                {topScore > 0
                  ? Math.round((userPosition.totalScore / topScore) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    topScore > 0
                      ? Math.min((userPosition.totalScore / topScore) * 100, 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Motivasyon Mesajı */}
      {userPosition && userRank > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            {userRank === 1 && (
              <>
                🎉 <strong>Harika!</strong> Liderlik tablosunda birinci sıradasınız!
                Bu performansı sürdürün!
              </>
            )}
            {userRank === 2 && (
              <>
                🥈 <strong>Çok iyi!</strong> İkinci sıradasınız! Biraz daha çaba ile
                lider olabilirsiniz!
              </>
            )}
            {userRank === 3 && (
              <>
                🥉 <strong>Tebrikler!</strong> Üçüncü sıradasınız! Devam edin!
              </>
            )}
            {userRank > 3 && userRank <= 10 && (
              <>
                💪 <strong>İyi gidiyorsunuz!</strong> İlk 10'dasınız. Biraz daha
                aktivite ile üst sıralara çıkabilirsiniz!
              </>
            )}
            {userRank > 10 && (
              <>
                🚀 <strong>Başlangıç güzel!</strong> Daha fazla paylaşım, yorum ve
                aktivite ile sıralamada yükseleceksiniz!
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
