import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/shop/rewards
 * Mağaza ödüllerini listeler (filtreleme ve sıralama ile)
 * 
 * Query parametreleri:
 * - category: string (DIGITAL, PHYSICAL, PREMIUM)
 * - sortBy: string (price, popular, new)
 * - type: RewardType (BADGE, THEME, AVATAR, etc.)
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
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'order';
    const type = searchParams.get('type');

    // Filtreleme koşulları
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    // Sıralama
    let orderBy: any = { order: 'asc' };

    switch (sortBy) {
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'popular':
        // Popülerlik için satış sayısına göre sıralama
        // Bu kısım için UserReward sayısını kullanabiliriz
        orderBy = { order: 'asc' }; // Şimdilik varsayılan
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { order: 'asc' };
    }

    // Ödülleri getir
    const rewards = await prisma.reward.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            userRewards: true,
          },
        },
      },
    });

    // Kullanıcının coin bakiyesini getir
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true },
    });

    // Stok durumunu kontrol et ve ödülleri formatla
    const formattedRewards = rewards.map((reward) => ({
      id: reward.id,
      type: reward.type,
      category: reward.category,
      name: reward.name,
      description: reward.description,
      imageUrl: reward.imageUrl,
      price: reward.price,
      stock: reward.stock,
      isActive: reward.isActive,
      isFeatured: reward.isFeatured,
      order: reward.order,
      purchaseCount: reward._count.userRewards,
      inStock: reward.stock === null || reward.stock > 0,
      canAfford: (user?.coins || 0) >= reward.price,
    }));

    return NextResponse.json({
      success: true,
      data: {
        rewards: formattedRewards,
        userCoins: user?.coins || 0,
      },
    });
  } catch (error) {
    console.error('Ödül listesi getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Ödüller yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
