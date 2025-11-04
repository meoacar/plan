import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserRewards } from '@/lib/reward-system';

/**
 * GET /api/shop/my-rewards
 * Kullanıcının satın aldığı ödülleri getirir
 * 
 * Query parametreleri:
 * - includeUsed: boolean (varsayılan: true)
 * - includeExpired: boolean (varsayılan: true)
 * - type: RewardType (opsiyonel)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeUsed = searchParams.get('includeUsed') !== 'false';
    const includeExpired = searchParams.get('includeExpired') !== 'false';
    const type = searchParams.get('type');

    // Kullanıcının ödüllerini getir
    const rewards = await getUserRewards(session.user.id, {
      includeUsed,
      includeExpired,
      rewardType: type as any,
    });

    // Ödülleri formatla
    const formattedRewards = rewards.map((userReward) => {
      const isExpired = userReward.expiresAt && userReward.expiresAt < new Date();
      const isActive = !isExpired && (!userReward.expiresAt || userReward.expiresAt > new Date());

      return {
        id: userReward.id,
        rewardId: userReward.rewardId,
        reward: {
          id: userReward.reward.id,
          name: userReward.reward.name,
          description: userReward.reward.description,
          type: userReward.reward.type,
          category: userReward.reward.category,
          imageUrl: userReward.reward.imageUrl,
        },
        coinsPaid: userReward.coinsPaid,
        purchasedAt: userReward.purchasedAt,
        isUsed: userReward.isUsed,
        usedAt: userReward.usedAt,
        expiresAt: userReward.expiresAt,
        isExpired,
        isActive,
        rewardData: userReward.rewardData,
      };
    });

    // Kategorilere göre grupla
    const grouped = {
      active: formattedRewards.filter(r => r.isActive && !r.isUsed),
      used: formattedRewards.filter(r => r.isUsed && !r.isExpired),
      expired: formattedRewards.filter(r => r.isExpired),
    };

    return NextResponse.json({
      success: true,
      data: {
        rewards: formattedRewards,
        grouped,
        stats: {
          total: formattedRewards.length,
          active: grouped.active.length,
          used: grouped.used.length,
          expired: grouped.expired.length,
        },
      },
    });
  } catch (error) {
    console.error('Kullanıcı ödülleri getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Ödülleriniz yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
