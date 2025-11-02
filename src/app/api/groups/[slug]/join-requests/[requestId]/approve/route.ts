import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser, getUserName, getGroupName, groupNotificationTemplates } from '@/lib/group-notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; requestId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Grubu bul
    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Kullanıcının admin veya moderator olduğunu kontrol et
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (!membership || membership.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Katılma isteğini bul
    const joinRequest = await prisma.groupJoinRequest.findUnique({
      where: { id: params.requestId },
      include: { user: true },
    });

    if (!joinRequest) {
      return NextResponse.json({ error: 'İstek bulunamadı' }, { status: 404 });
    }

    if (joinRequest.groupId !== group.id) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Bu istek zaten işlenmiş' },
        { status: 400 }
      );
    }

    // Transaction ile hem isteği onayla hem de üye ekle
    await prisma.$transaction([
      // İsteği onayla
      prisma.groupJoinRequest.update({
        where: { id: params.requestId },
        data: { status: 'APPROVED' },
      }),
      // Üye olarak ekle
      prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: joinRequest.userId,
          role: 'MEMBER',
        },
      }),
    ]);

    // Kullanıcıya bildirim gönder
    const groupName = await getGroupName(group.id);
    const notification = groupNotificationTemplates.joinRequestApproved(groupName);
    
    notifyUser({
      userId: joinRequest.userId,
      type: 'GROUP_JOIN_APPROVED',
      title: notification.title,
      message: notification.message,
      actionUrl: `/groups/${params.slug}`,
      actorId: session.user.id,
      relatedId: group.id,
    }).catch(err => console.error('Failed to send approval notification:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Katılma isteği onaylama hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
