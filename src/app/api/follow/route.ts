import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// POST /api/follow - Kullanıcıyı takip et
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const followingId = body.followingId || body.userId;

    if (!followingId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Kendini takip edemez
    if (followingId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Kullanıcının var olup olmadığını kontrol et
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, name: true, username: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Zaten takip ediliyor mu kontrol et
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following', message: 'Zaten takip ediyorsunuz' }, { status: 400 });
    }

    // Takip et
    const follow = await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: followingId,
      },
    });

    // Bildirim gönder
    try {
      await createNotification({
        userId: followingId,
        type: 'NEW_FOLLOWER',
        title: 'Yeni Takipçi',
        message: `${session.user.name} sizi takip etmeye başladı`,
        actionUrl: `/profile/${session.user.id}`,
        actorId: session.user.id,
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Bildirim hatası takip işlemini engellemez
    }

    return NextResponse.json({ success: true, follow, message: 'Takip edildi' });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error', message: 'Bir hata oluştu' }, { status: 500 });
  }
}

// DELETE /api/follow - Takibi bırak
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Takibi bırak
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
