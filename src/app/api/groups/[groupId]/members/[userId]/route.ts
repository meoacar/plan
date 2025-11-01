import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string; userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Grubu kontrol et
    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // İşlemi yapan kişinin yetkisini kontrol et
    const requesterMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: session.user.id,
        },
      },
    });

    if (!requesterMember) {
      return NextResponse.json(
        { error: 'Bu grubun üyesi değilsiniz' },
        { status: 403 }
      );
    }

    // Hedef üyeyi kontrol et
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.userId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü
    // Moderatör sadece MEMBER'ları çıkarabilir
    if (requesterMember.role === 'MODERATOR') {
      if (targetMember.role !== 'MEMBER') {
        return NextResponse.json(
          { error: 'Moderatörler sadece üyeleri çıkarabilir' },
          { status: 403 }
        );
      }
    }
    // MEMBER kendini çıkarabilir ama başkasını çıkaramaz
    else if (requesterMember.role === 'MEMBER') {
      if (params.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Bu işlem için yetkiniz yok' },
          { status: 403 }
        );
      }
    }

    // Admin ise ve tek admin ise çıkaramaz
    if (targetMember.role === 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: params.groupId,
          role: 'ADMIN',
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Grupta en az bir admin olmalıdır. Önce başka bir üyeyi admin yapın.' },
          { status: 400 }
        );
      }
    }

    // Üyeyi çıkar
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Üye başarıyla çıkarıldı',
    });
  } catch (error) {
    console.error('Üye çıkarma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
