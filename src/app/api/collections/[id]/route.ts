import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      plans: {
        include: {
          plan: {
            include: {
              user: { select: { name: true, image: true } },
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!collection.isPublic && collection.userId !== session?.user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(collection);
}

export async function PATCH(
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

  const { name, description, isPublic } = await req.json();
  const updated = await prisma.collection.update({
    where: { id },
    data: { name, description, isPublic },
  });

  return NextResponse.json(updated);
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

  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection || collection.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
