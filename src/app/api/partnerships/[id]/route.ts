// src/app/api/partnerships/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePartnershipSchema = z.object({
  status: z.enum(['ACTIVE', 'REJECTED', 'ENDED']),
});

// Partner talebini kabul/reddet veya partnerliği sonlandır
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = updatePartnershipSchema.parse(body);

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece ilgili kullanıcılar işlem yapabilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // PENDING durumundaysa sadece partner kabul/reddedebilir
    if (partnership.status === 'PENDING' && partnership.partnerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sadece talep alan kullanıcı kabul/reddedebilir' },
        { status: 403 }
      );
    }

    const updateData: any = { status };

    if (status === 'ACTIVE') {
      updateData.acceptedAt = new Date();
      // XP kazandır (kabul eden)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { xp: { increment: 20 } },
      });
    } else if (status === 'ENDED') {
      updateData.endedAt = new Date();
    }

    const updatedPartnership = await prisma.accountabilityPartnership.update({
      where: { id },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPartnership);
  } catch (error) {
    console.error('Partnership update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Partnerlik detayını getir
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            startWeight: true,
            goalWeight: true,
            streak: true,
            level: true,
            xp: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            startWeight: true,
            goalWeight: true,
            streak: true,
            level: true,
            xp: true,
          },
        },
        sharedGoals: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            messages: true,
            checkIns: true,
          },
        },
      },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece ilgili kullanıcılar görebilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(partnership);
  } catch (error) {
    console.error('Partnership fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Partnerliği sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece ilgili kullanıcılar silebilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.accountabilityPartnership.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Partnerlik silindi' });
  } catch (error) {
    console.error('Partnership delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
