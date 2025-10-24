import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge bulunamadı' }, { status: 404 });
    }

    if (!challenge.isActive) {
      return NextResponse.json({ error: 'Challenge aktif değil' }, { status: 400 });
    }

    if (new Date() > challenge.endDate) {
      return NextResponse.json({ error: 'Challenge süresi dolmuş' }, { status: 400 });
    }

    // Zaten katılmış mı kontrol et
    const existing = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId: challenge.id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Zaten katıldınız' }, { status: 400 });
    }

    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId: challenge.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Challenge katılma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
