import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMember, getGroupName, groupNotificationTemplates } from '@/lib/group-notifications';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string; userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = roleSchema.parse(body);

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

    if (!requesterMember || requesterMember.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
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

    // Moderatör sadece MEMBER rolünü değiştirebilir
    if (requesterMember.role === 'MODERATOR') {
      if (targetMember.role !== 'MEMBER' || role !== 'MEMBER') {
        return NextResponse.json(
          { error: 'Moderatörler sadece üyelerin rolünü değiştirebilir' },
          { status: 403 }
        );
      }
    }

    // Admin kendini düşüremez (en az bir admin kalmalı)
    if (targetMember.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: params.groupId,
          role: 'ADMIN',
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Grupta en az bir admin olmalıdır' },
          { status: 400 }
        );
      }
    }

    // Rolü güncelle
    const updatedMember = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.userId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    // Kullanıcıya rol değişikliği bildirimi gönder
    const groupName = await getGroupName(params.groupId);
    const roleNames: Record<string, string> = {
      ADMIN: 'Yönetici',
      MODERATOR: 'Moderatör',
      MEMBER: 'Üye',
    };
    const notification = groupNotificationTemplates.roleChanged(groupName, roleNames[role]);
    
    notifyGroupMember(params.userId, {
      type: 'GROUP_ROLE_CHANGED',
      title: notification.title,
      message: notification.message,
      actionUrl: `/groups/${params.groupId}`,
      actorId: session.user.id!,
      relatedId: params.groupId,
    }).catch(err => console.error('Failed to send role change notification:', err));

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Rol değiştirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
