// src/app/api/partnerships/[id]/goals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  targetDate: z.string().datetime(),
});

// Ortak hedef oluştur
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, targetDate } = createGoalSchema.parse(body);

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece aktif partnerliklerde hedef oluşturulabilir
    if (partnership.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Sadece aktif partnerliklerde hedef oluşturabilirsiniz' },
        { status: 400 }
      );
    }

    // Sadece ilgili kullanıcılar hedef oluşturabilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const goal = await prisma.partnershipGoal.create({
      data: {
        partnershipId: id,
        title,
        description,
        targetDate: new Date(targetDate),
        createdBy: session.user.id,
      },
    });

    // XP kazandır
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 15 } },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Goal creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Ortak hedefleri listele
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const completed = searchParams.get('completed');

    const partnership = await prisma.accountabilityPartnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnerlik bulunamadı' }, { status: 404 });
    }

    // Sadece ilgili kullanıcılar görebilir
    if (
      partnership.requesterId !== session.user.id &&
      partnership.partnerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const where: any = { partnershipId: id };
    if (completed !== null) {
      where.completed = completed === 'true';
    }

    const goals = await prisma.partnershipGoal.findMany({
      where,
      orderBy: [{ completed: 'asc' }, { targetDate: 'asc' }],
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Goals fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
