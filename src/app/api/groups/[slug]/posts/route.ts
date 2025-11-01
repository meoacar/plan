import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createPostSchema = z.object({
  content: z.string().min(1, 'İçerik boş olamaz').max(5000, 'İçerik çok uzun'),
  imageUrl: z.string().url('Geçersiz resim URL').optional(),
  postType: z.enum(['UPDATE', 'ACHIEVEMENT', 'MOTIVATION', 'PROGRESS', 'PHOTO']).default('UPDATE'),
  metadata: z.any().optional(),
});

// POST /api/groups/[slug]/posts - Paylaşım oluşturma
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Grubu bul
    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    if (group.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Grup henüz onaylanmamış' }, { status: 403 });
    }

    // Üyelik kontrolü
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Bu grubun üyesi değilsiniz' }, { status: 403 });
    }

    // Request body'yi parse et
    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    // Paylaşım oluştur
    const post = await prisma.groupPost.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
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

    // Son aktivite zamanını güncelle
    await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
      data: {
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Paylaşım oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// GET /api/groups/[slug]/posts - Akış getirme (cursor-based pagination)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Grubu bul
    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true, isPrivate: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    if (group.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Grup henüz onaylanmamış' }, { status: 403 });
    }

    // Özel grup ise üyelik kontrolü
    if (group.isPrivate) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
      }

      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: session.user.id,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Bu grubun üyesi değilsiniz' }, { status: 403 });
      }
    }

    // Paylaşımları getir
    const posts = await prisma.groupPost.findMany({
      where: {
        groupId: group.id,
      },
      take: limit + 1, // Bir fazla al, sonraki sayfa var mı kontrol için
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1, // Cursor'ı atla
      }),
      orderBy: {
        createdAt: 'desc',
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
        likes: session?.user
          ? {
              where: {
                userId: session.user.id,
              },
              select: {
                id: true,
              },
            }
          : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Sonraki sayfa var mı kontrol et
    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].id : null;

    // İsLiked alanını ekle
    const postsWithLikeStatus = postsToReturn.map((post) => ({
      ...post,
      isLiked: session?.user ? (post.likes as any[]).length > 0 : false,
      likes: undefined, // likes array'ini kaldır
    }));

    return NextResponse.json({
      posts: postsWithLikeStatus,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Paylaşımları getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
