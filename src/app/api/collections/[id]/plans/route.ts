import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection || collection.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { planId, note } = await req.json();

  const maxOrder = await prisma.collectionPlan.findFirst({
    where: { collectionId: id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const collectionPlan = await prisma.collectionPlan.create({
    data: {
      collectionId: id,
      planId,
      note,
      order: (maxOrder?.order || 0) + 1,
    },
  });

  return NextResponse.json(collectionPlan);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('planId');

  if (!planId) {
    return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
  }

  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection || collection.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.collectionPlan.deleteMany({
    where: { collectionId: id, planId },
  });

  return NextResponse.json({ success: true });
}
