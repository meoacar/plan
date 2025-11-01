import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createCommentSchema = z.object({
  content: z.string().min(1, 'Yorum boş olamaz').max(1000, 'Yorum çok uzun'),
});

// POST /api/groups/[slug]/posts/[postId]/comments - Yorum ekleme
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; postId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Paylaşımı ve grubu kontrol et
    const post = await prisma.groupPost.findUnique({
      where: { id: params.postId },
      include: {
        group: {
          select: {
            id: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Paylaşım bulunamadı' }, { status: 404 });
    }

    if (post.group.slug !== params.slug) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    if (post.group.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Grup henüz onaylanmamış' }, { status: 403 });
    }

    // Üyelik kontrolü
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: post.group.id,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Bu grubun üyesi değilsiniz' }, { status: 403 });
    }

    // Request body'yi parse et
    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Yorum oluştur
    const comment = await prisma.groupPostComment.create({
      data: {
        postId: params.postId,
        userId: session.user.id,
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

    // Son aktivite zamanını güncelle
    await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: post.group.id,
          userId: session.user.id,
        },
      },
      data: {
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Yorum oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// GET /api/groups/[slug]/posts/[postId]/comments - Yorumları getirme
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; postId: string } }
) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Paylaşımı ve grubu kontrol et
    const post = await prisma.groupPost.findUnique({
      where: { id: params.postId },
      include: {
        group: {
          select: {
            id: true,
            slug: true,
            status: true,
            isPrivate: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Paylaşım bulunamadı' }, { status: 404 });
    }

    if (post.group.slug !== params.slug) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    if (post.group.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Grup henüz onaylanmamış' }, { status: 403 });
    }

    // Özel grup ise üyelik kontrolü
    if (post.group.isPrivate) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
      }

      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: post.group.id,
            userId: session.user.id,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Bu grubun üyesi değilsiniz' }, { status: 403 });
      }
    }

    // Yorumları getir
    const [comments, totalCount] = await Promise.all([
      prisma.groupPostComment.findMany({
        where: {
          postId: params.postId,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'asc', // Yorumlar eskiden yeniye
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
      }),
      prisma.groupPostComment.count({
        where: {
          postId: params.postId,
        },
      }),
    ]);

    return NextResponse.json({
      comments,
      totalCount,
      hasMore: offset + comments.length < totalCount,
    });
  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
