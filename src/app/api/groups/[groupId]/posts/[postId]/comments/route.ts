import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMember, getGroupName, getUserName, groupNotificationTemplates } from '@/lib/group-notifications';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// POST /api/groups/[groupId]/posts/[postId]/comments - Yorum ekle
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
      select: { 
        id: true, 
        userId: true, 
        groupId: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post || post.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Paylaşım bulunamadı' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = createCommentSchema.parse(body);

    // Yorum oluştur
    const comment = await prisma.groupPostComment.create({
      data: {
        postId,
        userId: session.user.id!,
        content: validatedData.content,
      },
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

    // Paylaşım sahibine bildirim gönder (kendi paylaşımı değilse)
    if (post.userId !== session.user.id!) {
      const groupName = await getGroupName(groupId);
      const commenterName = await getUserName(session.user.id!);
      const postAuthorName = post.user.name || 'Kullanıcı';
      const notification = groupNotificationTemplates.newComment(groupName, commenterName, postAuthorName);
      
      notifyGroupMember(post.userId, {
        type: 'GROUP_NEW_COMMENT',
        title: notification.title,
        message: notification.message,
        actionUrl: `/groups/${groupId}`,
        actorId: session.user.id!,
        relatedId: postId,
      }).catch(err => console.error('Failed to send comment notification:', err));
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Yorum oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/posts/[postId]/comments - Yorumları getir
export async function GET(
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

    // Yorumları getir
    const comments = await prisma.groupPostComment.findMany({
      where: { postId },
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
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
