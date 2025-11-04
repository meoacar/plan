import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/admin/rewards/[id]
 * Ödülü günceller
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Reward modelinin varlığını kontrol et
    if (!prisma.reward) {
      return NextResponse.json(
        { error: 'Reward modeli henüz oluşturulmamış. Lütfen önce migration çalıştırın.' },
        { status: 500 }
      );
    }

    // Ödülün var olup olmadığını kontrol et
    const existingReward = await prisma.reward.findUnique({
      where: { id },
    });

    if (!existingReward) {
      return NextResponse.json(
        { error: 'Ödül bulunamadı' },
        { status: 404 }
      );
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {};

    if (body.type !== undefined) updateData.type = body.type;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.digitalData !== undefined) updateData.digitalData = body.digitalData;
    if (body.physicalData !== undefined) updateData.physicalData = body.physicalData;
    if (body.premiumData !== undefined) updateData.premiumData = body.premiumData;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.order !== undefined) updateData.order = body.order;

    // Ödülü güncelle
    const reward = await prisma.reward.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: { reward },
      message: 'Ödül başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Ödül güncelleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Ödül güncellenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/rewards/[id]
 * Ödülü siler veya pasif hale getirir
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Reward modelinin varlığını kontrol et
    if (!prisma.reward) {
      return NextResponse.json(
        { error: 'Reward modeli henüz oluşturulmamış. Lütfen önce migration çalıştırın.' },
        { status: 500 }
      );
    }

    // Ödülün var olup olmadığını kontrol et
    const existingReward = await prisma.reward.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userRewards: true,
          },
        },
      },
    });

    if (!existingReward) {
      return NextResponse.json(
        { error: 'Ödül bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer ödül satın alınmışsa, silme yerine pasif hale getir
    if (existingReward._count.userRewards > 0) {
      await prisma.reward.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: `Ödül ${existingReward._count.userRewards} kullanıcı tarafından satın alındığı için silme yerine pasif hale getirildi`,
      });
    }

    // Satın alınmamışsa tamamen sil
    await prisma.reward.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Ödül başarıyla silindi',
    });
  } catch (error) {
    console.error('Ödül silme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Ödül silinirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
