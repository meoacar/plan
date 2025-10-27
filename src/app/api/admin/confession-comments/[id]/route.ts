import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    }

    const comment = await prisma.confessionComment.update({
      where: { id },
      data: { status },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'COMMENT_DELETED',
        description: `İtiraf yorumu ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}: ${id}`,
        targetId: id,
        targetType: 'confession_comment',
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Admin comment update error:', error);
    return NextResponse.json({ error: 'Yorum güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = params;

    await prisma.confessionComment.delete({
      where: { id },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: 'COMMENT_DELETED',
        description: `İtiraf yorumu silindi: ${id}`,
        targetId: id,
        targetType: 'confession_comment',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin comment delete error:', error);
    return NextResponse.json({ error: 'Yorum silinemedi' }, { status: 500 });
  }
}
