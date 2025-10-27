import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAIReply } from '@/lib/ai-confession';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');

    let orderBy: any = { createdAt: 'desc' };
    
    if (sort === 'popular') {
      orderBy = { likes: { _count: 'desc' } };
    }

    const confessions = await prisma.confession.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy,
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            reactions: true,
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    return NextResponse.json({
      confessions,
      nextCursor: confessions.length === limit ? confessions[confessions.length - 1].id : null,
    });
  } catch (error) {
    console.error('Confession fetch error:', error);
    return NextResponse.json({ error: 'İtiraflar yüklenemedi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { text, isAnonymous = true } = await req.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'İtiraf en az 10 karakter olmalı' }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({ error: 'İtiraf en fazla 500 karakter olabilir' }, { status: 400 });
    }

    // AI yanıtı oluştur
    const aiReply = await generateAIReply(text);

    const confession = await prisma.confession.create({
      data: {
        userId: session.user.id,
        text: text.trim(),
        aiReply,
        isAnonymous,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            reactions: true,
          },
        },
      },
    });

    // XP ver
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 50 } },
    });

    return NextResponse.json(confession);
  } catch (error) {
    console.error('Confession creation error:', error);
    return NextResponse.json({ error: 'İtiraf oluşturulamadı' }, { status: 500 });
  }
}
