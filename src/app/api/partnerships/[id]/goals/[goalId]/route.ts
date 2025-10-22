// src/app/api/partnerships/[id]/goals/[goalId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Hedefi tamamla
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, goalId } = await params;

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece ilgili kullanıcılar işlem yapabilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const goal = await prisma.partnershipGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.partnershipId !== id) {
      return NextResponse.json({ error: 'Hedef bulunamadı' }, { status: 404 });
    }

    const updatedGoal = await prisma.partnershipGoal.update({
      where: { id: goalId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Her iki partnere de XP kazandır
    await prisma.user.updateMany({
      where: {
        id: { in: [partnership.requesterId, partnership.partnerId] },
      },
      data: { xp: { increment: 50 } },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Goal update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Hedefi sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, goalId } = await params;

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece ilgili kullanıcılar silebilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const goal = await prisma.partnershipGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.partnershipId !== id) {
      return NextResponse.json({ error: 'Hedef bulunamadı' }, { status: 404 });
    }

    await prisma.partnershipGoal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ message: 'Hedef silindi' });
  } catch (error) {
    console.error('Goal delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
