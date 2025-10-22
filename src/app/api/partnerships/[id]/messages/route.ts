// src/app/api/partnerships/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});

// Mesaj gönder
export async function POST(
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
    const { content } = createMessageSchema.parse(body);

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece aktif partnerliklerde mesajlaşma
    if (partnership.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Sadece aktif partnerliklerde mesajlaşabilirsiniz' },
        { status: 400 }
      );
    }

    // Sadece ilgili kullanıcılar mesaj gönderebilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const message = await prisma.partnershipMessage.create({
      data: {
        partnershipId: id,
        senderId: session.user.id,
        content,
      },
    });

    // XP kazandır
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 5 } },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Message creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mesajları listele
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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
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

    const messages = await prisma.partnershipMessage.findMany({
      where: { partnershipId: id },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    // Okunmamış mesajları okundu olarak işaretle
    await prisma.partnershipMessage.updateMany({
      where: {
        partnershipId: id,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor,
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
