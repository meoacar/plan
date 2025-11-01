import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMembers, getGroupName, getUserName, groupNotificationTemplates } from '@/lib/group-notifications';
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional(),
  postType: z.enum(['UPDATE', 'ACHIEVEMENT', 'MOTIVATION', 'PROGRESS', 'PHOTO']).default('UPDATE'),
  metadata: z.any().optional(),
});

// POST /api/groups/[groupId]/posts - Paylaşım oluştur
export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;

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

    const body = await req.json();
    const validatedData = createPostSchema.parse(body);

    // Paylaşım oluştur
    const post = await prisma.groupPost.create({
      data: {
        groupId,
        userId: session.user.id!,
        content: validatedData.content,
        imageUrl: validatedData.imageUrl,
        postType: validatedData.postType,
        metadata: validatedData.metadata,
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Grup üyelerine bildirim gönder (async)
    const groupName = await getGroupName(groupId);
    const authorName = await getUserName(session.user.id!);
    const notification = groupNotificationTemplates.newPost(groupName, authorName);
    
    notifyGroupMembers({
      groupId,
      type: 'GROUP_NEW_POST',
      title: notification.title,
      message: notification.message,
      actionUrl: `/groups/${groupId}`,
      actorId: session.user.id!,
      relatedId: post.id,
      excludeUserId: session.user.id!,
    }).catch(err => console.error('Failed to send post notifications:', err));

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Paylaşım oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/posts - Grup akışını getir
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;

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

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Paylaşımları getir (cursor-based pagination)
    const posts = await prisma.groupPost.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    let nextCursor: string | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    // Kullanıcının beğendiği paylaşımları kontrol et
    const likedPosts = await prisma.groupPostLike.findMany({
      where: {
        userId: session.user.id!,
        postId: { in: posts.map(p => p.id) },
      },
      select: { postId: true },
    });

    const likedPostIds = new Set(likedPosts.map(l => l.postId));

    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLikedByUser: likedPostIds.has(post.id),
    }));

    return NextResponse.json({
      posts: postsWithLikeStatus,
      nextCursor,
    });
  } catch (error) {
    console.error('Paylaşımları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
