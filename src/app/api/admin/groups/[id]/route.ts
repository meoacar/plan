import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          take: 50,
        },
        challenges: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        posts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            members: true,
            challenges: true,
            posts: true,
            joinRequests: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Grup detay hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { action, rejectionReason, ...updateData } = body;

    if (action === 'approve') {
      const group = await prisma.group.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      await logActivity({
        userId: session.user.id,
        type: 'GROUP_APPROVED',
        targetId: group.id,
        targetType: 'Group',
        description: `"${group.name}" grubu onaylandı`,
      });

      return NextResponse.json(group);
    }

    if (action === 'reject') {
      const group = await prisma.group.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason,
        },
      });

      await logActivity({
        userId: session.user.id,
        type: 'GROUP_REJECTED',
        targetId: group.id,
        targetType: 'Group',
        description: `"${group.name}" grubu reddedildi: ${rejectionReason}`,
      });

      return NextResponse.json(group);
    }

    // Genel güncelleme
    const group = await prisma.group.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Grup güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: { name: true },
    });

    await prisma.group.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: session.user.id,
      type: 'GROUP_DELETED',
      targetId: params.id,
      targetType: 'Group',
      description: `"${group?.name}" grubu silindi`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Grup silme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
