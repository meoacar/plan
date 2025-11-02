import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser, getGroupName, groupNotificationTemplates } from '@/lib/group-notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; memberId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['ADMIN', 'MODERATOR', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 });
    }

    // Grubu bul
    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Kullanıcının admin olduğunu kontrol et (sadece adminler rol değiştirebilir)
    const currentUserMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (!currentUserMembership || currentUserMembership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Hedef üyeyi bul
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

    // Kendi rolünü değiştiremez
    if (targetMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendi rolünüzü değiştiremezsiniz' },
        { status: 400 }
      );
    }

    // Eğer son admin'in rolü değiştiriliyorsa kontrol et
    if (targetMember.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: group.id,
          role: 'ADMIN',
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Son admin\'in rolü değiştirilemez' },
          { status: 400 }
        );
      }
    }

    // Rolü güncelle
    await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: params.memberId,
        },
      },
      data: { role },
    });

    // Kullanıcıya bildirim gönder
    const groupName = await getGroupName(group.id);
    const roleLabels = {
      ADMIN: 'Yönetici',
      MODERATOR: 'Moderatör',
      MEMBER: 'Üye',
    };
    const notification = groupNotificationTemplates.roleChanged(
      groupName,
      roleLabels[role as keyof typeof roleLabels]
    );

    notifyUser({
      userId: params.memberId,
      type: 'GROUP_ROLE_CHANGED',
      title: notification.title,
      message: notification.message,
      actionUrl: `/groups/${params.slug}`,
      actorId: session.user.id,
      relatedId: group.id,
    }).catch(err => console.error('Failed to send role change notification:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rol değiştirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
