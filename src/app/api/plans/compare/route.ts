import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids')?.split(',') || [];

  if (ids.length < 2 || ids.length > 3) {
    return NextResponse.json(
      { error: '2-3 plan seçmelisiniz' },
      { status: 400 }
    );
  }

  const plans = await prisma.plan.findMany({
    where: {
      id: { in: ids },
      status: 'APPROVED',
    },
    include: {
      user: { select: { name: true, image: true } },
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true, favorites: true } },
    },
  });

  if (plans.length !== ids.length) {
    return NextResponse.json({ error: 'Bazı planlar bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(plans);
}
