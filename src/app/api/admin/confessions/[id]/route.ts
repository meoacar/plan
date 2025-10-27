import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { status, rejectionReason, text } = await req.json();
    const { id } = params;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'APPROVED') {
        updateData.approvedBy = session.user.id;
        updateData.approvedAt = new Date();
        updateData.rejectionReason = null;
      } else if (status === 'REJECTED') {
        updateData.rejectionReason = rejectionReason || 'Uygunsuz içerik';
      }
    }

    if (text !== undefined) {
      updateData.text = text;
    }

    const confession = await prisma.confession.update({
      where: { id },
      data: updateData,
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

    // Log activity
    await logActivity({
      userId: session.user.id,
      type: status === 'APPROVED' ? 'PLAN_APPROVED' : status === 'REJECTED' ? 'PLAN_REJECTED' : 'PLAN_DELETED',
      description: `İtiraf ${status === 'APPROVED' ? 'onaylandı' : status === 'REJECTED' ? 'reddedildi' : 'güncellendi'}: ${id}`,
      targetId: id,
      targetType: 'confession',
    });

    return NextResponse.json(confession);
  } catch (error) {
    console.error('Admin confession update error:', error);
    return NextResponse.json({ error: 'İtiraf güncellenemedi' }, { status: 500 });
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

    await prisma.confession.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      type: 'PLAN_DELETED',
      description: `İtiraf silindi: ${id}`,
      targetId: id,
      targetType: 'confession',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin confession delete error:', error);
    return NextResponse.json({ error: 'İtiraf silinemedi' }, { status: 500 });
  }
}
