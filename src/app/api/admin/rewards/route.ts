import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/rewards
 * Tüm ödülleri listeler (admin için)
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Reward modelinin varlığını kontrol et
    if (!prisma.reward) {
      return NextResponse.json(
        { error: 'Reward modeli henüz oluşturulmamış. Lütfen önce migration çalıştırın.' },
        { status: 500 }
      );
    }

    // Ödülleri getir
    const rewards = await prisma.reward.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: {
            userRewards: true,
          },
        },
      },
    });

    // İstatistikleri hesapla
    const stats = {
      total: rewards.length,
      active: rewards.filter((r: any) => r.isActive).length,
      sold: rewards.reduce((sum: number, r: any) => sum + r._count.userRewards, 0),
      revenue: 0, // Toplam coin geliri hesaplanabilir
    };

    // Satış gelirini hesapla
    const userRewards = await prisma.userReward.findMany({
      select: {
        coinsPaid: true,
      },
    });
    stats.revenue = userRewards.reduce((sum: number, ur: any) => sum + ur.coinsPaid, 0);

    // Ödülleri formatla
    const formattedRewards = rewards.map((reward: any) => ({
      id: reward.id,
      type: reward.type,
      category: reward.category,
      name: reward.name,
      description: reward.description,
      imageUrl: reward.imageUrl,
      price: reward.price,
      stock: reward.stock,
      digitalData: reward.digitalData,
      physicalData: reward.physicalData,
      premiumData: reward.premiumData,
      isActive: reward.isActive,
      isFeatured: reward.isFeatured,
      order: reward.order,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
      purchaseCount: reward._count.userRewards,
      inStock: reward.stock === null || reward.stock > 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        rewards: formattedRewards,
        stats,
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

/**
 * POST /api/admin/rewards
 * Yeni ödül oluşturur
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validasyon
    if (!body.name || !body.description || !body.type || !body.category) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    if (body.price === undefined || body.price < 0) {
      return NextResponse.json(
        { error: 'Geçerli bir fiyat giriniz' },
        { status: 400 }
      );
    }

    // Reward modelinin varlığını kontrol et
    if (!prisma.reward) {
      return NextResponse.json(
        { error: 'Reward modeli henüz oluşturulmamış. Lütfen önce migration çalıştırın.' },
        { status: 500 }
      );
    }

    // Ödül oluştur
    const reward = await prisma.reward.create({
      data: {
        type: body.type,
        category: body.category,
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl || null,
        price: body.price,
        stock: body.stock !== undefined ? body.stock : null,
        digitalData: body.digitalData || null,
        physicalData: body.physicalData || null,
        premiumData: body.premiumData || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isFeatured: body.isFeatured || false,
        order: body.order || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: { reward },
      message: 'Ödül başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('Ödül oluşturma hatası:', error);
    return NextResponse.json(
      { 
        error: 'Ödül oluşturulurken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
