import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.confessionLike.findUnique({
      where: {
        confessionId_userId: {
          confessionId: id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      await prisma.confessionLike.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ liked: false });
    }

    await prisma.confessionLike.create({
      data: {
        confessionId: id,
        userId: session.user.id,
      },
    });

    // XP ver
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 5 } },
    });

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
