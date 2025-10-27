import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      select: { title: true },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge bulunamadı' }, { status: 404 });
    }

    await prisma.challenge.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: session.user.id,
      type: 'CHALLENGE_DELETED',
      targetId: params.id,
      targetType: 'Challenge',
      description: `"${challenge.title}" challenge'ı silindi`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Challenge silme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
