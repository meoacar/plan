import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMember, getGroupName, getUserName, groupNotificationTemplates } from '@/lib/group-notifications';

// POST /api/groups/[groupId]/posts/[postId]/like - Beğeni ekle/kaldır
export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string; postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, postId } = params;

    // Grup üyeliğini kontrol et
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id!,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Bu grubun üyesi değilsiniz' },
        { status: 403 }
      );
    }

    // Paylaşımı kontrol et
    const post = await prisma.groupPost.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, groupId: true },
    });

    if (!post || post.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Paylaşım bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut beğeniyi kontrol et
    const existingLike = await prisma.groupPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id!,
        },
      },
    });

    if (existingLike) {
      // Beğeniyi kaldır
      await prisma.groupPostLike.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({
        liked: false,
        message: 'Beğeni kaldırıldı',
      });
    } else {
      // Beğeni ekle
      await prisma.groupPostLike.create({
        data: {
          postId,
          userId: session.user.id!,
        },
      });

      // Paylaşım sahibine bildirim gönder (kendi paylaşımı değilse)
      if (post.userId !== session.user.id!) {
        const groupName = await getGroupName(groupId);
        const likerName = await getUserName(session.user.id!);
        const notification = groupNotificationTemplates.postLike(groupName, likerName);
        
        notifyGroupMember(post.userId, {
          type: 'GROUP_POST_LIKE',
          title: notification.title,
          message: notification.message,
          actionUrl: `/groups/${groupId}`,
          actorId: session.user.id!,
          relatedId: postId,
        }).catch(err => console.error('Failed to send like notification:', err));
      }

      return NextResponse.json({
        liked: true,
        message: 'Beğenildi',
      });
    }
  } catch (error) {
    console.error('Beğeni işlemi hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
