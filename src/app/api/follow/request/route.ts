import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// PUT /api/follow/request - Takip isteğini kabul et veya reddet
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { followId, action } = body; // action: 'accept' veya 'reject'

    if (!followId || !action) {
      return NextResponse.json({ error: 'Follow ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // İsteği bul ve kontrol et
    const followRequest = await prisma.follow.findUnique({
      where: { id: followId },
      include: {
        follower: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    if (!followRequest) {
      return NextResponse.json({ error: 'Follow request not found' }, { status: 404 });
    }

    // Sadece takip edilen kişi onaylayabilir
    if (followRequest.followingId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Zaten işlenmiş mi kontrol et
    if (followRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // İsteği güncelle
    const updatedFollow = await prisma.follow.update({
      where: { id: followId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
        acceptedAt: action === 'accept' ? new Date() : null,
        rejectedAt: action === 'reject' ? new Date() : null,
      },
    });

    // Kabul edildiyse bildirim gönder
    if (action === 'accept') {
      try {
        await createNotification({
          userId: followRequest.followerId,
          type: 'FOLLOW_ACCEPTED',
          title: 'Takip İsteği Kabul Edildi',
          message: `${session.user.name} takip isteğinizi kabul etti`,
          actionUrl: `/profile/${session.user.id}`,
          actorId: session.user.id,
          relatedId: followId,
        });
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      follow: updatedFollow,
      message: action === 'accept' ? 'Takip isteği kabul edildi' : 'Takip isteği reddedildi',
    });
  } catch (error) {
    console.error('Follow request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/follow/request - Bekleyen takip isteklerini getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Bekleyen istekleri getir
    const [requests, total] = await Promise.all([
      prisma.follow.findMany({
        where: {
          followingId: session.user.id,
          status: 'PENDING',
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({
        where: {
          followingId: session.user.id,
          status: 'PENDING',
        },
      }),
    ]);

    return NextResponse.json({
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get follow requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
