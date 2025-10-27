import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id } = params;
    const { emoji } = await req.json();

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji seçmelisiniz' }, { status: 400 });
    }

    const existing = await prisma.confessionReaction.findUnique({
      where: {
        confessionId_userId_emoji: {
          confessionId: id,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existing) {
      await prisma.confessionReaction.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ reacted: false });
    }

    await prisma.confessionReaction.create({
      data: {
        confessionId: id,
        userId: session.user.id,
        emoji,
      },
    });

    return NextResponse.json({ reacted: true });
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
