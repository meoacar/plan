import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; memberId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Grubu bul
    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Kullanıcının yetkisini kontrol et
    const currentUserMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (!currentUserMembership || currentUserMembership.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Çıkarılacak üyeyi bul
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: params.memberId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü: Moderatör sadece normal üyeleri çıkarabilir
    if (
      currentUserMembership.role === 'MODERATOR' &&
      targetMember.role !== 'MEMBER'
    ) {
      return NextResponse.json(
        { error: 'Sadece normal üyeleri çıkarabilirsiniz' },
        { status: 403 }
      );
    }

    // Admin kendini çıkaramaz
    if (targetMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendinizi çıkaramazsınız' },
        { status: 400 }
      );
    }

    // Son admin kontrolü
    if (targetMember.role === 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: group.id,
          role: 'ADMIN',
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Son admin çıkarılamaz' },
          { status: 400 }
        );
      }
    }

    // Üyeyi çıkar
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: params.memberId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Üye çıkarma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
