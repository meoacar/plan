import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/groups/[slug]/posts/[postId]/like - Beğeni ekleme/kaldırma
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

    // Mevcut beğeniyi kontrol et
    const existingLike = await prisma.groupPostLike.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: session.user.id,
        },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      // Beğeniyi kaldır
      await prisma.groupPostLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      isLiked = false;
    } else {
      // Beğeni ekle
      await prisma.groupPostLike.create({
        data: {
          postId: params.postId,
          userId: session.user.id,
        },
      });
      isLiked = true;
    }

    // Güncel beğeni sayısını al
    const likeCount = await prisma.groupPostLike.count({
      where: {
        postId: params.postId,
      },
    });

    return NextResponse.json({
      isLiked,
      likeCount,
    });
  } catch (error) {
    console.error('Beğeni işlemi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
