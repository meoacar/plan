import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_EMOJIS = ['👍', '❤️', '🔥', '💪', '🎯', '🤔'];

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Tüm tepkileri say
    const reactions = await prisma.blogReaction.groupBy({
      by: ['emoji'],
      where: {
        postId: params.postId,
      },
      _count: {
        emoji: true,
      },
    });

    // Kullanıcının tepkilerini kontrol et
    let userReactions: string[] = [];
    if (userId) {
      const userReactionRecords = await prisma.blogReaction.findMany({
        where: {
          postId: params.postId,
          userId,
        },
        select: {
          emoji: true,
        },
      });
      userReactions = userReactionRecords.map((r) => r.emoji);
    }

    // Sonuçları formatla
    const result = VALID_EMOJIS.map((emoji) => {
      const reaction = reactions.find((r) => r.emoji === emoji);
      return {
        emoji,
        count: reaction?._count.emoji || 0,
        hasReacted: userReactions.includes(emoji),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emoji } = await req.json();

    if (!VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
    }

    // Aynı emoji varsa sil, yoksa ekle (toggle)
    const existing = await prisma.blogReaction.findUnique({
      where: {
        postId_userId_emoji: {
          postId: params.postId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existing) {
      await prisma.blogReaction.delete({
        where: {
          id: existing.id,
        },
      });
    } else {
      await prisma.blogReaction.create({
        data: {
          postId: params.postId,
          userId: session.user.id,
          emoji,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    );
  }
}
