import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || session.user.id;

  const collections = await prisma.collection.findMany({
    where: {
      userId,
      ...(userId !== session.user.id ? { isPublic: true } : {}),
    },
    include: {
      _count: { select: { plans: true } },
      plans: {
        take: 3,
        include: { plan: { select: { id: true, title: true, imageUrl: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(collections);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, isPublic } = await req.json();

  const collection = await prisma.collection.create({
    data: {
      userId: session.user.id,
      name,
      description,
      isPublic: isPublic || false,
    },
  });

  return NextResponse.json(collection);
}
