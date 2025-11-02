import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateGroupStats } from '@/lib/group-stats';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Grubu bul
    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Kullanıcının grup üyesi olup olmadığını kontrol et
    if (group.members.length === 0) {
      return NextResponse.json(
        { error: 'Bu işlem için grup üyesi olmalısınız' },
        { status: 403 }
      );
    }

    // İstatistikleri yeniden hesapla
    await calculateGroupStats(group.id);

    return NextResponse.json({
      success: true,
      message: 'İstatistikler başarıyla güncellendi',
    });
  } catch (error) {
    console.error('İstatistik hesaplama hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler hesaplanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
