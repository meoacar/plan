import { prisma } from '@/lib/prisma';

/**
 * Grup öneri sistemi
 * 
 * Uygunluk Skoru Hesaplama:
 * 1. Hedef uyumu: %40
 *    - Aynı hedef türü: +40 puan
 *    - Benzer hedef kilo: +20 puan
 * 2. Arkadaş uyumu: %30
 *    - Arkadaşların olduğu grup: +30 puan
 * 3. Aktivite uyumu: %20
 *    - Kullanıcının aktivite seviyesine yakın: +20 puan
 * 4. Konum uyumu: %10
 *    - Aynı şehir: +10 puan
 */

interface RecommendationScore {
  groupId: string;
  goalMatchScore: number;
  friendMatchScore: number;
  activityMatchScore: number;
  locationMatchScore: number;
  totalScore: number;
}

/**
 * Hedef uyumu hesaplama
 * Kullanıcının hedef kilosu ile grubun ortalama hedef kilosu arasındaki benzerlik
 */
export async function calculateGoalMatch(
  userId: string,
  groupId: string
): Promise<number> {
  // Kullanıcının hedef kilosunu al
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { goalWeight: true, startWeight: true },
  });

  if (!user?.goalWeight || !user?.startWeight) {
    return 0;
  }

  const userWeightLossGoal = user.startWeight - user.goalWeight;

  // Grubun üyelerinin ortalama hedef kilosunu hesapla
  const groupMemberIds = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  const groupUsers = await prisma.user.findMany({
    where: {
      id: {
        in: groupMemberIds.map((m) => m.userId),
      },
    },
    select: { goalWeight: true, startWeight: true },
  });

  const validMembers = groupUsers.filter(
    (u) => u.goalWeight && u.startWeight
  );

  if (validMembers.length === 0) {
    return 0;
  }

  const avgGroupWeightLossGoal =
    validMembers.reduce(
      (sum, u) => sum + (u.startWeight! - u.goalWeight!),
      0
    ) / validMembers.length;

  // Benzerlik hesapla (0-40 puan arası)
  const difference = Math.abs(userWeightLossGoal - avgGroupWeightLossGoal);
  
  // 0-10 kg fark: 40 puan
  // 10-20 kg fark: 20 puan
  // 20+ kg fark: 0 puan
  if (difference <= 10) {
    return 40;
  } else if (difference <= 20) {
    return 20;
  } else {
    return 0;
  }
}

/**
 * Arkadaş uyumu hesaplama
 * Kullanıcının takip ettiği kişilerin bu grupta olup olmadığını kontrol et
 */
export async function calculateFriendMatch(
  userId: string,
  groupId: string
): Promise<number> {
  // Kullanıcının takip ettiği kişileri al
  const following = await prisma.follow.findMany({
    where: {
      followerId: userId,
      status: 'ACCEPTED',
    },
    select: {
      followingId: true,
    },
  });

  if (following.length === 0) {
    return 0;
  }

  const followingIds = following.map((f) => f.followingId);

  // Bu kişilerden kaç tanesi grupta
  const friendsInGroup = await prisma.groupMember.count({
    where: {
      groupId,
      userId: {
        in: followingIds,
      },
    },
  });

  // Arkadaş sayısına göre puan ver (0-30 puan arası)
  if (friendsInGroup === 0) {
    return 0;
  } else if (friendsInGroup === 1) {
    return 15;
  } else if (friendsInGroup === 2) {
    return 25;
  } else {
    return 30;
  }
}

/**
 * Aktivite uyumu hesaplama
 * Kullanıcının aktivite seviyesi ile grubun aktivite seviyesini karşılaştır
 */
export async function calculateActivityMatch(
  userId: string,
  groupId: string
): Promise<number> {
  // Kullanıcının son 30 gündeki aktivitesini hesapla
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userActivity = await prisma.activityLog.count({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  // Grubun ortalama aktivitesini hesapla
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  if (groupMembers.length === 0) {
    return 0;
  }

  const groupMemberIds = groupMembers.map((m) => m.userId);

  const groupActivity = await prisma.activityLog.count({
    where: {
      userId: {
        in: groupMemberIds,
      },
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  const avgGroupActivity = groupActivity / groupMembers.length;

  // Aktivite seviyelerini kategorize et
  const getUserActivityLevel = (count: number) => {
    if (count < 10) return 'low';
    if (count < 30) return 'medium';
    return 'high';
  };

  const userLevel = getUserActivityLevel(userActivity);
  const groupLevel = getUserActivityLevel(avgGroupActivity);

  // Aynı seviye: 20 puan
  // Bir seviye fark: 10 puan
  // İki seviye fark: 0 puan
  if (userLevel === groupLevel) {
    return 20;
  } else if (
    (userLevel === 'low' && groupLevel === 'medium') ||
    (userLevel === 'medium' && groupLevel === 'low') ||
    (userLevel === 'medium' && groupLevel === 'high') ||
    (userLevel === 'high' && groupLevel === 'medium')
  ) {
    return 10;
  } else {
    return 0;
  }
}

/**
 * Konum uyumu hesaplama
 * Kullanıcı ile grup üyelerinin aynı şehirde olup olmadığını kontrol et
 */
export async function calculateLocationMatch(
  userId: string,
  groupId: string
): Promise<number> {
  // Kullanıcının şehrini al
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { city: true },
  });

  if (!user?.city) {
    return 0;
  }

  // Gruptaki aynı şehirden üye sayısını hesapla
  const groupMemberIds = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  const sameCityMembers = await prisma.user.count({
    where: {
      id: {
        in: groupMemberIds.map((m) => m.userId),
      },
      city: user.city,
    },
  });

  // Aynı şehirden üye varsa 10 puan
  return sameCityMembers > 0 ? 10 : 0;
}

/**
 * Toplam uygunluk skoru hesaplama
 */
export async function calculateTotalMatchScore(
  userId: string,
  groupId: string
): Promise<RecommendationScore> {
  const goalMatchScore = await calculateGoalMatch(userId, groupId);
  const friendMatchScore = await calculateFriendMatch(userId, groupId);
  const activityMatchScore = await calculateActivityMatch(userId, groupId);
  const locationMatchScore = await calculateLocationMatch(userId, groupId);

  const totalScore =
    goalMatchScore + friendMatchScore + activityMatchScore + locationMatchScore;

  return {
    groupId,
    goalMatchScore,
    friendMatchScore,
    activityMatchScore,
    locationMatchScore,
    totalScore,
  };
}

/**
 * Kullanıcı için önerilen grupları getir
 */
export async function getRecommendedGroups(
  userId: string,
  limit: number = 10
) {
  // Kullanıcının zaten üye olduğu grupları al
  const userGroups = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });

  const userGroupIds = userGroups.map((g) => g.groupId);

  // Kullanıcının kapattığı önerileri al
  const dismissedRecommendations = await prisma.activityLog.findMany({
    where: {
      userId,
      type: 'CACHE_CLEARED', // Geçici olarak mevcut bir type kullanıyoruz
      targetType: 'GROUP_RECOMMENDATION',
    },
    select: {
      targetId: true,
    },
  });

  const dismissedGroupIds = dismissedRecommendations
    .map((r) => r.targetId)
    .filter((id): id is string => id !== null);

  // Tüm aktif grupları al (kullanıcının üye olmadığı ve kapatmadığı)
  const availableGroups = await prisma.group.findMany({
    where: {
      id: {
        notIn: [...userGroupIds, ...dismissedGroupIds],
      },
      status: 'APPROVED',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      isPrivate: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
    take: 50, // İlk 50 grubu değerlendir
  });

  // Her grup için uygunluk skorunu hesapla
  const groupScores: (RecommendationScore & {
    group: typeof availableGroups[0];
  })[] = [];

  for (const group of availableGroups) {
    const score = await calculateTotalMatchScore(userId, group.id);
    groupScores.push({
      ...score,
      group,
    });
  }

  // Skora göre sırala ve en iyi sonuçları döndür
  const sortedGroups = groupScores
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  return sortedGroups.map((item) => ({
    ...item.group,
    matchScore: {
      total: item.totalScore,
      goal: item.goalMatchScore,
      friends: item.friendMatchScore,
      activity: item.activityMatchScore,
      location: item.locationMatchScore,
    },
  }));
}

/**
 * Öneri nedenini açıklayan metin oluştur
 */
export function getRecommendationReason(matchScore: {
  total: number;
  goal: number;
  friends: number;
  activity: number;
  location: number;
}): string {
  const reasons: string[] = [];

  if (matchScore.goal >= 20) {
    reasons.push('Hedefleriniz benzer');
  }

  if (matchScore.friends > 0) {
    reasons.push('Arkadaşlarınız bu grupta');
  }

  if (matchScore.activity >= 10) {
    reasons.push('Aktivite seviyeniz uyumlu');
  }

  if (matchScore.location > 0) {
    reasons.push('Aynı şehirden üyeler var');
  }

  if (reasons.length === 0) {
    return 'Sizin için uygun bir grup';
  }

  return reasons.join(' • ');
}
