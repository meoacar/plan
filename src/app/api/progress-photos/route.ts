import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const session = await auth();
  const isOwner = session?.user?.id === userId;

  const photos = await prisma.progressPhoto.findMany({
    where: {
      userId,
      ...(isOwner ? {} : { isPublic: true }),
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { imageUrl, weight, description, isPublic } = await req.json();

  const photo = await prisma.progressPhoto.create({
    data: {
      userId: session.user.id,
      imageUrl,
      weight,
      description,
      isPublic: isPublic || false,
    },
  });

  return NextResponse.json(photo);
}
