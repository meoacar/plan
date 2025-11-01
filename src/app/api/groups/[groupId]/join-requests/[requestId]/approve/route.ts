import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMember, notifyGroupMembers, getGroupName, getUserName, groupNotificationTemplates } from '@/lib/group-notifications';

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
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü - sadece admin ve moderatör onaylayabilir
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

    // Maksimum üye kontrolü
    if (group.maxMembers && group._count.members >= group.maxMembers) {
      return NextResponse.json({ error: 'Grup dolu' }, { status: 400 });
    }

    // Zaten üye mi kontrol et
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: joinRequest.userId,
        },
      },
    });

    if (existingMember) {
      // İsteği güncelle ama üye ekleme
      await prisma.groupJoinRequest.update({
        where: { id: params.requestId },
        data: { status: 'APPROVED' },
      });

      return NextResponse.json({
        success: true,
        message: 'Kullanıcı zaten üye',
      });
    }

    // Transaction ile hem isteği onayla hem üye ekle
    const result = await prisma.$transaction([
      prisma.groupJoinRequest.update({
        where: { id: params.requestId },
        data: { status: 'APPROVED' },
      }),
      prisma.groupMember.create({
        data: {
          groupId: params.groupId,
          userId: joinRequest.userId,
          role: 'MEMBER',
        },
      }),
    ]);

    // Kullanıcıya onay bildirimi gönder
    const groupName = await getGroupName(params.groupId);
    const approvalNotification = groupNotificationTemplates.joinApproved(groupName);
    
    notifyGroupMember(joinRequest.userId, {
      type: 'GROUP_JOIN_APPROVED',
      title: approvalNotification.title,
      message: approvalNotification.message,
      actionUrl: `/groups/${params.groupId}`,
      actorId: session.user.id!,
      relatedId: params.groupId,
    }).catch(err => console.error('Failed to send join approval notification:', err));

    // Diğer üyelere yeni üye bildirimi gönder
    const memberName = await getUserName(joinRequest.userId);
    const memberJoinedNotification = groupNotificationTemplates.memberJoined(groupName, memberName);
    
    notifyGroupMembers({
      groupId: params.groupId,
      type: 'GROUP_MEMBER_JOINED',
      title: memberJoinedNotification.title,
      message: memberJoinedNotification.message,
      actionUrl: `/groups/${params.groupId}/members`,
      actorId: joinRequest.userId,
      relatedId: params.groupId,
      excludeUserId: joinRequest.userId,
    }).catch(err => console.error('Failed to send member joined notifications:', err));

    return NextResponse.json({
      success: true,
      message: 'Katılma isteği onaylandı',
      member: result[1],
    });
  } catch (error) {
    console.error('Katılma isteği onaylama hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
