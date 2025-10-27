import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = params;

    // Onaylanmış yorumları + kullanıcının kendi yorumlarını göster
    const comments = await prisma.confessionComment.findMany({
      where: { 
        confessionId: id,
        OR: [
          { status: 'APPROVED' },
          ...(session?.user?.id ? [{ userId: session.user.id }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json({ error: 'Yorumlar yüklenemedi' }, { status: 500 });
  }
}

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
    const { content, isAnonymous = true } = await req.json();

    if (!content || content.trim().length < 2) {
      return NextResponse.json({ error: 'Yorum en az 2 karakter olmalı' }, { status: 400 });
    }

    if (content.length > 300) {
      return NextResponse.json({ error: 'Yorum en fazla 300 karakter olabilir' }, { status: 400 });
    }

    const comment = await prisma.confessionComment.create({
      data: {
        confessionId: id,
        userId: session.user.id,
        content: content.trim(),
        isAnonymous,
        status: 'PENDING', // Admin onayı gerekli
      },
    });

    // XP ver
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 10 } },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Yorum eklenemedi' }, { status: 500 });
  }
}
