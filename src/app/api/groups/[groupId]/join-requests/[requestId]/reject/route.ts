import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMember, getGroupName, groupNotificationTemplates } from '@/lib/group-notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string; requestId: string } }
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

    // Yetki kontrolü - sadece admin ve moderatör reddedebilir
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member || member.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Katılma isteğini kontrol et
    const joinRequest = await prisma.groupJoinRequest.findUnique({
      where: { id: params.requestId },
    });

    if (!joinRequest) {
      return NextResponse.json({ error: 'Katılma isteği bulunamadı' }, { status: 404 });
    }

    if (joinRequest.groupId !== params.groupId) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Bu istek zaten işleme alınmış' },
        { status: 400 }
      );
    }

    // İsteği reddet
    await prisma.groupJoinRequest.update({
      where: { id: params.requestId },
      data: { status: 'REJECTED' },
    });

    // Kullanıcıya red bildirimi gönder
    const groupName = await getGroupName(params.groupId);
    const rejectionNotification = groupNotificationTemplates.joinRejected(groupName);
    
    notifyGroupMember(joinRequest.userId, {
      type: 'GROUP_JOIN_REJECTED',
      title: rejectionNotification.title,
      message: rejectionNotification.message,
      actionUrl: `/groups`,
      actorId: session.user.id!,
      relatedId: params.groupId,
    }).catch(err => console.error('Failed to send join rejection notification:', err));

    return NextResponse.json({
      success: true,
      message: 'Katılma isteği reddedildi',
    });
  } catch (error) {
    console.error('Katılma isteği reddetme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
