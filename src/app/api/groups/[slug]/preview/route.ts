import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Grup bilgilerini al
    const group = await prisma.group.findUnique({
      where: { slug },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Grup bulunamadı' },
        { status: 404 }
      );
    }

    // Üye ve challenge sayılarını al
    const [memberCount, challengeCount] = await Promise.all([
      prisma.groupMember.count({ where: { groupId: group.id } }),
      prisma.challenge.count({ where: { groupId: group.id } }),
    ]);

    // Son 5 aktiviteyi al (paylaşımlar ve yorumlar)
    const recentPosts = await prisma.groupPost.findMany({
      where: { groupId: group.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Her post için like ve comment sayılarını al
    const recentActivities = await Promise.all(
      recentPosts.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          prisma.groupPostLike.count({ where: { postId: post.id } }),
          prisma.groupPostComment.count({ where: { postId: post.id } }),
        ]);
        return {
          ...post,
          _count: {
            likes: likesCount,
            comments: commentsCount,
          },
        };
      })
    );

    // En popüler 3 gönderiyi al (beğeni sayısına göre)
    const allPostsForPopular = await prisma.groupPost.findMany({
      where: { groupId: group.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Her post için like ve comment sayılarını al ve sırala
    const postsWithCounts = await Promise.all(
      allPostsForPopular.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          prisma.groupPostLike.count({ where: { postId: post.id } }),
          prisma.groupPostComment.count({ where: { postId: post.id } }),
        ]);
        return {
          ...post,
          _count: {
            likes: likesCount,
            comments: commentsCount,
          },
        };
      })
    );

    // Beğeni sayısına göre sırala ve ilk 3'ü al
    const popularPosts = postsWithCounts
      .sort((a, b) => b._count.likes - a._count.likes)
      .slice(0, 3);

    // Üye yorumlarını al (rastgele 3 yorum)
    const allComments = await prisma.groupPostComment.findMany({
      where: {
        post: {
          groupId: group.id,
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Rastgele 3 yorum seç
    const shuffledTestimonials = allComments
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Temel istatistikleri hesapla
    const stats = await prisma.groupStats.findUnique({
      where: { groupId: group.id },
      select: {
        totalMembers: true,
        activeMembers: true,
        totalWeightLoss: true,
        avgWeightLoss: true,
        totalPosts: true,
        totalMessages: true,
        activeRate: true,
      },
    });

    // Aktif üye sayısını hesapla (son 7 gün içinde aktif olanlar)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeMembersCount = await prisma.groupMember.count({
      where: {
        groupId: group.id,
        lastActiveAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Toplam mesaj sayısı
    const totalMessages = await prisma.groupMessage.count({
      where: { groupId: group.id },
    });

    // Toplam paylaşım sayısı
    const totalPosts = await prisma.groupPost.count({
      where: { groupId: group.id },
    });

    const previewData = {
      group: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        goalType: group.goalType,
        imageUrl: group.imageUrl,
        isPrivate: group.isPrivate,
        level: (group as any).level || null,
        gender: (group as any).gender || null,
        ageGroup: (group as any).ageGroup || null,
        createdAt: group.createdAt,
        memberCount: memberCount,
        challengeCount: challengeCount,
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        content: activity.content,
        postType: (activity as any).postType || 'UPDATE',
        createdAt: activity.createdAt,
        user: activity.user,
        _count: activity._count,
      })),
      popularPosts: popularPosts.map(post => ({
        id: post.id,
        content: post.content,
        postType: (post as any).postType || 'UPDATE',
        imageUrl: (post as any).imageUrl || null,
        createdAt: post.createdAt,
        user: post.user,
        _count: post._count,
      })),
      memberTestimonials: shuffledTestimonials,
      stats: {
        totalMembers: stats?.totalMembers || memberCount,
        activeMembers: stats?.activeMembers || activeMembersCount,
        totalWeightLoss: stats?.totalWeightLoss || 0,
        avgWeightLoss: stats?.avgWeightLoss || 0,
        totalPosts: stats?.totalPosts || totalPosts,
        totalMessages: stats?.totalMessages || totalMessages,
        activeRate: stats?.activeRate || (memberCount > 0 ? (activeMembersCount / memberCount) * 100 : 0),
      },
    };

    return NextResponse.json(previewData);
  } catch (error) {
    console.error('Grup önizleme hatası:', error);
    return NextResponse.json(
      { error: 'Grup önizlemesi yüklenemedi' },
      { status: 500 }
    );
  }
}
