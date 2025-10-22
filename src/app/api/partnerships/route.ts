// src/app/api/partnerships/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPartnershipSchema = z.object({
  partnerId: z.string(),
  message: z.string().optional(),
});

// Partner talebi gönder
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { partnerId, message } = createPartnershipSchema.parse(body);

    // Kendine talep gönderemez
    if (partnerId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendinize partner talebi gönderemezsiniz' },
        { status: 400 }
      );
    }

    // Partner var mı kontrol et
    const partnerExists = await prisma.user.findUnique({
      where: { id: partnerId },
    });

    if (!partnerExists) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Mevcut partnerlik var mı kontrol et
    const existingPartnership = await prisma.accountabilityPartnership.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, partnerId },
          { requesterId: partnerId, partnerId: session.user.id },
        ],
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (existingPartnership) {
      return NextResponse.json(
        { error: 'Bu kullanıcıyla zaten bir partnerlik talebiniz var' },
        { status: 400 }
      );
    }

    // Yeni partnerlik talebi oluştur
    const partnership = await prisma.accountabilityPartnership.create({
      data: {
        requesterId: session.user.id,
        partnerId,
        message,
        status: 'PENDING',
      },
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

    // XP kazandır
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 10 } },
    });

    return NextResponse.json(partnership, { status: 201 });
  } catch (error) {
    console.error('Partnership creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Tüm partnerlikleri listele
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'PENDING' | 'ACTIVE' | 'ENDED' | 'REJECTED' | null;

    const where: any = {
      OR: [
        { requesterId: session.user.id },
        { partnerId: session.user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const partnerships = await prisma.accountabilityPartnership.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
            startWeight: true,
            goalWeight: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            image: true,
            startWeight: true,
            goalWeight: true,
          },
        },
        _count: {
          select: {
            messages: true,
            sharedGoals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(partnerships);
  } catch (error) {
    console.error('Partnerships fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
